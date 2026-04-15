const Course = require('../models/course.model');

exports.saveCourse = async (req, res) => {
    try {
        const { title, coursePlan, skillsMap } = req.body;

        if (!title || !coursePlan || !skillsMap) {
            return res.status(400).json({ message: 'Missing required course parameters' });
        }

        const newCourse = new Course({
            userId: req.user.id,
            title,
            coursePlan,
            skillsMap
        });

        const savedCourse = await newCourse.save();
        res.json(savedCourse);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
