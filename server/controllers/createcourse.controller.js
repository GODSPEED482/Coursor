const Course = require("../models/Course.model");
const User = require("../models/user.model");

async function createCourseController(req, res) {
  try {
    const { courseName, user } = req.body;
    if (!courseName || !user) {
      return res.status(400).json({ message: "Course name and user are required." });
    }
    const newCourse = new Course({
      title: courseName,
      description: "This is a course created by the user : " + user.name,
    }); 
    const existingUser = await User.findOne({email: user.email});
    existingUser.Courses.push(newCourse);
    await existingUser.save();
    await newCourse.save();
    return res.status(201).json({ success : "true",message: "Course created successfully.", course: newCourse });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }


}

module.exports = createCourseController;