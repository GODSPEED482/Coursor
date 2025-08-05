const router = require("express").Router(); 
const createCourseController = require("../controllers/createcourse.controller");
const getCourseController = require("../controllers/getcourse.controller");
router.post("/create",createCourseController);
router.post("/get",getCourseController);

module.exports = router;