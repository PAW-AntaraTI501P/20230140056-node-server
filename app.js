const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Set view engine ke EJS
app.set("view engine", "ejs");

// Routing utama
app.get("/", (req, res) => {
  res.render("index"); // Harus ada views/index.ejs
});

app.get("/contact", (req, res) => {
  res.render("contact"); // Harus ada views/contact.ejs
});

// Handler untuk route yang tidak ditemukan
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
