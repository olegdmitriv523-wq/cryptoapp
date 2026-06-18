const express = require("express");
const router = express.Router();
const db = require("../db/db");

// 💰 ДЕПОЗИТ
router.post("/deposit", (req, res) => {

  const userId = req.headers.authorization;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.json({ success: false, message: "Invalid amount" });
  }

  db.run(
    `UPDATE users 
     SET balance = balance + ?, deposit = deposit + ? 
     WHERE id = ?`,
    [amount, amount, userId],
    (err) => {

      if (err) {
        return res.json({ success: false });
      }

      res.json({ success: true });
    }
  );

});

// 💸 ВИВІД
router.post("/withdraw", (req, res) => {

  const userId = req.headers.authorization;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.json({ success: false, message: "Invalid amount" });
  }

  db.get(
    `SELECT balance FROM users WHERE id = ?`,
    [userId],
    (err, user) => {

      if (!user || user.balance < amount) {
        return res.json({ success: false, message: "Not enough balance" });
      }

      db.run(
        `UPDATE users 
         SET balance = balance - ? 
         WHERE id = ?`,
        [amount, userId],
        (e) => {

          if (e) {
            return res.json({ success: false });
          }

          res.json({ success: true });
        }
      );

    }
  );

});

module.exports = router;