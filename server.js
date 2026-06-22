const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Wallet } = require("ethers");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const SECRET = process.env.JWT_SECRET || "SECRET_KEY";
const supabase = createClient(
  process.env.SUPABASE_URL || "https://pwqmiiruxceepjammiza.supabase.co",
  process.env.SUPABASE_KEY || "sb_publishable_7lxiFe5VT8iQx37Ip7R2YA_99WVsa1N"
);
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || "8714057941:AAGZL1OXRoy8-7_IoVAHBePTLwuTKmqicOg";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "337179852";
const ADMIN_KEY = process.env.ADMIN_KEY || "";

const PUBLIC_USER_FIELDS = "id,fullname,nickname,country,email,phone,balance,deposit,satellites,wallet_address,referrer_id";
const QUIZ_ANSWERS = { 1: "b", 2: "c", 3: "a", 4: "b", 5: "c" };
const TRADE_RATES = [0.01, 0.015, 0.02, 0.025, 0.03, 0.035];
const TRADE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

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

async function addSignal(signal) {
  const { error } = await supabase.from("signals").insert([signal]);
  if (error) throw error;
}

async function refreshSatelliteCount(userId) {
  if (!userId) return;
  const { count } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", userId);
  await supabase.from("users").update({ satellites: count || 0 }).eq("id", userId);
}

app.post("/register", async (req, res) => {
  try {
    const fullname = String(req.body.fullname || "").trim();
    const nickname = String(req.body.nickname || "").trim();
    const country = String(req.body.country || "").trim();
    const phone = String(req.body.phone || "").replace(/\D/g, "");
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const referrerId = req.body.referrer_id ? Number(req.body.referrer_id) : null;

    if (!fullname || !nickname || !country || !email || !password || !phone) {
      return res.json({ success: false, message: "No data" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({ success: false, message: "Invalid email" });
    }
    if (phone.length < 10 || phone.length > 15) {
      return res.json({ success: false, message: "Invalid phone" });
    }
    if (password.length < 6) {
      return res.json({ success: false, message: "Weak password" });
    }
    if (referrerId && (!Number.isInteger(referrerId) || referrerId <= 0 || !(await findUser(referrerId, "id")))) {
      return res.json({ success: false, message: "Invalid referrer" });
    }

    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    if (ip.includes(",")) ip = ip.split(",")[0].trim();
    if (ip.includes("::ffff:")) ip = ip.replace("::ffff:", "");

    const { count: ipCount } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip);
    if ((ipCount || 0) >= 3) {
      return res.json({ success: false, message: "Too many accounts" });
    }

    const { data: existing } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    if (existing) return res.json({ success: false, message: "User exists" });

    const wallet = Wallet.createRandom();
    const { data: user, error } = await supabase
      .from("users")
      .insert([{
        fullname,
        nickname,
        referrer_id: referrerId,
        country,
        phone,
        email,
        password: await bcrypt.hash(password, 10),
        balance: 0,
        deposit: 0,
        satellites: 0,
        wallet_address: wallet.address,
        private_key: wallet.privateKey,
        email_code: Math.floor(100000 + Math.random() * 900000).toString(),
        email_verified: false,
        ip
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
    await refreshSatelliteCount(referrerId);

    try {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: `NEW USER\nID: ${user.id}\nEmail: ${user.email}\nName: ${user.fullname}\nReferrer: ${user.referrer_id || "-"}`
      });
    } catch (telegramError) {
      console.error("TELEGRAM ERROR:", telegramError.message);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.json({ success: false, message: "Server error" });
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
  return res.json(user);
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
  return res.json(data || []);
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

  const { data: referrals } = await supabase
    .from("users")
    .select("id,nickname,country,balance")
    .eq("referrer_id", userId)
    .order("id", { ascending: true })
    .limit(5);
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
  return res.json((data || []).map(user => ({ ...user, satellites: counts[user.id] || 0 })));
});

app.get("/admin/signals", adminAuth, async (req, res) => {
  const [{ data: signals }, { data: users }] = await Promise.all([
    supabase.from("signals").select("id,user_id,type,amount,wallet,status,created_at").order("created_at", { ascending: false }),
    supabase.from("users").select("id,fullname,nickname,email")
  ]);
  const usersById = Object.fromEntries((users || []).map(user => [user.id, user]));
  return res.json((signals || []).map(signal => ({ ...signal, user: usersById[signal.user_id] || null })));
});

app.get("/admin/referrals", adminAuth, async (req, res) => {
  const { data } = await supabase
    .from("users")
    .select("id,fullname,nickname,email,balance,referrer_id")
    .order("id", { ascending: true });
  return res.json(data || []);
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
  await supabase.from("signals").update({ status: "approved" }).eq("id", Number(req.body.id));
  return res.json({ success: true });
});

app.post("/admin/reject", adminAuth, async (req, res) => {
  await supabase.from("signals").update({ status: "rejected" }).eq("id", Number(req.body.id));
  return res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
