const auth = (req, res, next) => {
  // Example authentication logic
  const token = req.headers['authorization'];
  if (token) {
    // Validate token (this is just a placeholder)
    console.log("Token received:", token);
    next(); // Proceed to the next middleware or route handler
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = auth;
