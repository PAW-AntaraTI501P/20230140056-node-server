// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db");

const router = express.Router();

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Cek apakah email sudah ada
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) {
        return res.status(400).json({ msg: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user baru
      db.query(
        "INSERT INTO users SET ?",
        { email, password: hashedPassword },
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          return res.status(201).json({ msg: "User registered successfully" });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= LOGIN =================
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const user = results[0];
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id },
      "your_super_secret_jwt_key", // ganti dengan secret key dari .env
      { expiresIn: "1h" } // token berlaku 1 jam
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  });
});

module.exports = router;
