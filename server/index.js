const express = require("express");
const { run } = require("./config/db.config.js");
const User = require("./models/User.model.js");

const app = express();
app.use(express.json());
const port = 5000;

 
app.get("/", async (req, res) => {
  res.send(
    "Welcome to Backend PORT. You can find the APIs and their functionalities below :"
  );
});

// Start the server only after DB connection
run()
  .then(async () => {
    console.log("✅ Database connected successfully");
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
