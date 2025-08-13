const router = require("express").Router(); 
const createLessonController = require("../controllers/createlesson.controller");
router.post("/create", createLessonController);
module.exports =  router;