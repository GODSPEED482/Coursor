const Module = require("../models/Module.model");
const Lesson = require("../models/Lesson.model");
const generateLesson = require("../utils/ai.lesson.helper");
async function createLessonController(req,res){
    const mod_id = req.body.id;
    const module = await Module.findById(mod_id)
    if(!module){
        return res.status(404).json({
            message: "Module not found"
        })
    }
    if(module.lessons != null){
        return res.status(201).json({
            message: "Module already has lessons",
            module: module
        })
    }
    const lesson = await generateLesson(module.title);
    console.log("prints" + lesson.title); 
    
    const newLesson = new Lesson({
        title : lesson.title,
        content: lesson.content,
    })
    await newLesson.save();
    module.lessons = (newLesson);
    await module.save();
    return res.status(200).json({
        message: "Lesson created successfully",
        module: module
    });
}
module.exports = createLessonController;