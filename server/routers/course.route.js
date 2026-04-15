const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const courseController = require('../controllers/course.controller');

// POST /api/courses
router.post('/', auth, courseController.saveCourse);

// GET /api/courses
router.get('/', auth, courseController.getCourses);

module.exports = router;
