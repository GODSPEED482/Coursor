const mongoose = require("mongoose");
const Course = require("./Course.model").schema;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String, default: null },
  Courses: [Course],
});

const User = mongoose.model("User", userSchema);


module.exports = User;