const express = require("express");
const router = express.Router();
const db = require("../db/db");
const bcrypt = require("bcrypt");
const { Wallet } = require("ethers");

// 🔥 REGISTER
router.post("/register", async (req, res) => {

  const { email, password, referrer_id } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Missing data" });
  }

  try {

    const hash = await bcrypt.hash(password, 10);

    // 🔐 створення криптогаманця
    const wallet = Wallet.createRandom();

    db.run(
      `INSERT INTO users (email, password, wallet, private_key, referrer_id)
       VALUES (?, ?, ?, ?, ?)`,
      [email, hash, wallet.address, wallet.privateKey, referrer_id || null],
      function (err) {

        if (err) {
          return res.json({ success: false, message: "User exists" });
        }

        const newUserId = this.lastID;

        // 👥 реферал (сателіт)
        if (referrer_id) {
          db.run(
            `INSERT INTO referrals (user_id, referral_id) VALUES (?, ?)`,
            [referrer_id, newUserId]
          );
        }

        res.json({ success: true });

      }
    );

  } catch (e) {
    res.json({ success: false, message: "Server error" });
  }

});

// 🔥 LOGIN
router.post("/login", (req, res) => {

  const { email, password } = req.body;

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    async (err, user) => {

      if (!user) {
        return res.json({ success: false });
      }

      const ok = await bcrypt.compare(password, user.password);

      if (!ok) {
        return res.json({ success: false });
      }

      // 🔥 простий токен = user id
      res.json({
        success: true,
        token: user.id
      });

    }
  );

});

module.exports = router;