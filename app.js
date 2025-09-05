require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3001;
const db = require("./database/db");
const expressLayouts = require("express-ejs-layouts");

// ---- Tambahkan ini untuk import route & middleware ----
const authRoutes = require("./routes/auth"); // route otentikasi
const authMiddleware = require("./middleware/auth"); // middleware otentikasi
// ------------------------------------------------------

// Middleware
app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");
app.set("layout", "layouts/main");
app.use(expressLayouts);

// 🔹 Endpoint render EJS
app.get("/", (req, res) => {
  res.render("index", { layout: "layouts/main-layout" });
});

app.get("/contact", (req, res) => {
  res.render("contact", { layout: "layouts/main-layout" });
});

app.get("/todo-view", (req, res) => {
  db.query("SELECT * FROM todos", (err, todos) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.render("todo", { todos });
  });
});

// ====================== ROUTES ======================
// Gunakan route otentikasi
app.use("/api/auth", authRoutes);

// Lindungi route todos dengan middleware
app.use("/api/todos", authMiddleware);

// ===================================================

// 🔹 REST API TODO (sekarang dilindungi middleware di atas)

// GET todos
app.get("/api/todos", (req, res) => {
  const { search } = req.query;
  let query = "SELECT * FROM todos";
  const params = [];

  if (search) {
    query += " WHERE task LIKE ?";
    params.push(`%${search}%`);
  }

  db.query(query, params, (err, todos) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    res.json({ todos });
  });
});

// POST todo
app.post("/api/todos", (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: "Task is required" });

  const query = "INSERT INTO todos (task, completed) VALUES (?, ?)";
  db.query(query, [task, false], (err, result) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    res.status(201).json({
      id: result.insertId,
      task,
      completed: false,
    });
  });
});

// PUT todo
app.put("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  if (typeof completed !== "boolean") {
    return res
      .status(400)
      .json({ error: "Invalid 'completed' value. Must be a boolean." });
  }

  const query = "UPDATE todos SET completed = ? WHERE id = ?";
  db.query(query, [completed, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Todo not found" });

    res.json({ message: `Todo with ID ${id} updated successfully` });
  });
});

// DELETE todo
app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM todos WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Todo not found" });

    res.json({ message: `Todo with ID ${id} deleted successfully` });
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
