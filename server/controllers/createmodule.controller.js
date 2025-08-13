const Course = require("../models/Course.model");
const Module = require("../models/Module.model");
const generateModules = require("../utils/ai.helper");

const createModuleController = async (req, res) => {
  try {
    const course_id = req.body.id;

    const course = await Course.findOne({ _id: course_id });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if(course.modules.length>0)
      return res.status(200).json({
        message: "Modules already created for this course",
        course: course,
      });  
 
    const modules = await generateModules(course.title);

    if (modules.length) {
        course.modules = [];  
      for (const module of modules) {
        const newModule = new Module({
          title: module.title,
          description: module.description,
        });
        await newModule.save();
        course.modules.push(newModule);   
        } 
    }
 
    await course.save();

    res.status(200).json({
      message: "Modules created successfully",
      course : course,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = createModuleController;
