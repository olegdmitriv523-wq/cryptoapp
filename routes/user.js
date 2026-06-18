const express = require("express");
const router = express.Router();
const db = require("../db/db");

// 🔥 GET USER (профіль)
router.get("/me", (req, res) => {

  const userId = req.headers.authorization;

  if (!userId) {
    return res.json({ error: "No token" });
  }

  db.get(
    `SELECT id, email, balance, deposit, wallet FROM users WHERE id = ?`,
    [userId],
    (err, user) => {

      if (err || !user) {
        return res.json({ error: "User not found" });
      }

      // 👥 сателіти
      db.all(
        `SELECT * FROM referrals WHERE user_id = ?`,
        [userId],
        (e, refs) => {

          res.json({
            ...user,
            satellites: refs.length
          });

        }
      );

    }
  );

});

module.exports = router;