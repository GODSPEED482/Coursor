const express = require("express");
const { run } = require("./config/db.config.js"); 
const cors = require("cors");
const authRoute = require("./routers/authroute");
const courseRoute = require("./routers/course.route");
const app = express();
app.use(express.json());
const port = 5000;
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
 
app.use("/api/auth", authRoute);
app.use("/api/course",courseRoute);
app.get("/", async (req, res) => {
  res.send(
    "Welcome to Backend PORT. You can find the APIs and their functionalities below :"
  );
});
 
run()
  .then(async () => {
    console.log("-> Database connected successfully");
    app.listen(port, () => {
      console.log(` -> Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
