const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Middleware logger request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Koneksi database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "todo_db",
});

// GET: Ambil semua todos + filter + search + pagination
app.get("/api/todos", (req, res) => {
  let { search, completed, sort, order, page, limit } = req.query;

  let query = "SELECT * FROM todos WHERE 1=1";
  let params = [];

  // Search task
  if (search) {
    query += " AND task LIKE ?";
    params.push(`%${search}%`);
  }

  // Filter completed
  if (completed !== undefined) {
    query += " AND completed = ?";
    params.push(completed === "true" ? 1 : 0);
  }

  // Sorting
  if (sort) {
    order = order && order.toUpperCase() === "DESC" ? "DESC" : "ASC";
    query += ` ORDER BY ${db.escapeId(sort)} ${order}`;
  }

  // Pagination
  if (page && limit) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);
  }

  db.query(query, params, (err, todos) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ todos, count: todos.length });
  });
});

// POST: Tambah todo baru
app.post("/api/todos", (req, res) => {
  const { task } = req.body;
  if (!task || task.trim() === "") {
    return res.status(400).json({ error: "Task is required" });
  }

  const query = "INSERT INTO todos (task, completed) VALUES (?, ?)";
  db.query(query, [task.trim(), false], (err, result) => {
    if (err) {
      console.error("Database insert error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(201).json({
      message: "Todo added successfully",
      id: result.insertId,
      task,
      completed: false,
    });
  });
});

// PUT: Update todo (task atau completed)
app.put("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;

  // Validasi input
  if (task !== undefined && task.trim() === "") {
    return res.status(400).json({ error: "Task cannot be empty" });
  }
  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({ error: "Completed must be true/false" });
  }

  const query = "UPDATE todos SET task = COALESCE(?, task), completed = COALESCE(?, completed) WHERE id = ?";
  db.query(query, [task, completed, id], (err, result) => {
    if (err) {
      console.error("Database update error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo updated successfully" });
  });
});

// PATCH: Tandai selesai/belum (toggle completed)
app.patch("/api/todos/:id/toggle", (req, res) => {
  const { id } = req.params;
  db.query("UPDATE todos SET completed = NOT completed WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Database toggle error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo toggled successfully" });
  });
});

// DELETE: Hapus todo berdasarkan ID
app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM todos WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Database delete error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo deleted successfully" });
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
