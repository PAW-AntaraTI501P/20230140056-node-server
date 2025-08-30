const express = require("express");
const router = express.Router();
const db = require("../database/db"); // koneksi database

// GET semua tugas
router.get("/", (req, res) => {
  db.query("SELECT * FROM todos", (err, results) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    res.json(results);
  });
});

// GET tugas berdasarkan ID
router.get("/:id", (req, res) => {
  db.query("SELECT * FROM todos WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    if (results.length === 0) return res.status(404).json({ error: "Tugas tidak ditemukan" });
    res.json(results[0]);
  });
});

// POST tambah tugas baru
router.post("/", (req, res) => {
  const { task } = req.body;
  if (!task || task.trim() === "") {
    return res.status(400).json({ error: "Tugas tidak boleh kosong" });
  }

  db.query("INSERT INTO todos (task, completed) VALUES (?, ?)", [task.trim(), false], (err, results) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    const newTodo = { id: results.insertId, task: task.trim(), completed: false };
    res.status(201).json({
      message: "Tugas berhasil ditambahkan",
      data: newTodo,
    });
  });
});

// PUT update tugas
router.put("/:id", (req, res) => {
  const { task, completed = false } = req.body;

  if (!task || task.trim() === "") {
    return res.status(400).json({ error: "Tugas tidak boleh kosong" });
  }

  db.query(
    "UPDATE todos SET task = ?, completed = ? WHERE id = ?",
    [task.trim(), completed, req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Internal Server Error" });
      if (results.affectedRows === 0) return res.status(404).json({ error: "Tugas tidak ditemukan" });

      res.json({
        message: "Tugas berhasil diperbarui",
        data: { id: req.params.id, task: task.trim(), completed },
      });
    }
  );
});

// DELETE hapus tugas
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM todos WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    if (results.affectedRows === 0) return res.status(404).json({ error: "Tugas tidak ditemukan" });

    res.json({ message: "Tugas berhasil dihapus" });
  });
});

module.exports = router;
