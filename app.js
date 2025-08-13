require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database/db"); // Koneksi database
const todoRoutes = require("./routes/tododb.js"); // API routes

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");

// API CRUD
app.use("/todos", todoRoutes);

// API JSON: ambil data todos
app.get("/todos-data", (req, res) => {
  db.query("SELECT * FROM todos", (err, results) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.json(results);
  });
});

// Page EJS: daftar todos
app.get("/todos-pages", (req, res) => {
  db.query("SELECT * FROM todos", (err, results) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.render("todo", { todos: results });
  });
});

// Page EJS: daftar todos lain
app.get("/todos-list", (req, res) => {
  db.query("SELECT * FROM todos", (err, results) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.render("todos-page", { todos: results });
  });
});

// Halaman index
app.get("/", (req, res) => {
  res.render("index");
});

// Halaman contact
app.get("/contact", (req, res) => {
  res.render("contact");
});
app.get("/todo-view", (req, res) => {
  db.query("SELECT * FROM todos", (err, todos) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.render("todo", {
      todos: todos,
    });
  });
});
// 404 Handler
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// Jalankan server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
