const User = require("../models/user.model");
async function getCourseController(req, res) {
  try {
    const { user } = req.body;

    if (!user || !user.email) {
      return res.status(400).json({ message: "User email is required." });
    }

    const existingUser = await User.findOne({ email: user.email });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const courses = existingUser.Courses || [];
    if (courses.length === 0) {
      return res.status(210).json({ message: "No courses found for this user." });
    }

    return res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

module.exports = getCourseController;