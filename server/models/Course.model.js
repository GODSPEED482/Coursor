const mongoose = require("mongoose");
const Module = require("./Module.model");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,  
    modules : [Module.schema]
  }, 
);

const Course = mongoose.model("Course", courseSchema);  
module.exports = Course;