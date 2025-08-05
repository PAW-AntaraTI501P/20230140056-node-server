const express = require("express");
const cors = require("cors");
const { router: todoRoutes, todos } = require("./routes/todos.js");

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json()); // <- Wajib untuk parsing JSON body

// Routing API
app.use("/todos", todoRoutes);

// View engine
app.set("view engine", "ejs");

// Routing halaman
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

// Handler 404
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
