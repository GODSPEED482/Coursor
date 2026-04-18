const Course = require('../models/course.model');

exports.saveCourse = async (req, res) => {
    try {
        const { title, coursePlan, skillsMap, sessionId } = req.body;

        if (!title || !coursePlan || !skillsMap) {
            return res.status(400).json({ message: 'Missing required course parameters' });
        }

        const newCourse = new Course({
            _id: sessionId, // Use session ID as document ID
            userId: req.user.id,
            title,
            coursePlan,
            skillsMap
        });

        const savedCourse = await newCourse.save();
        res.json(savedCourse);
    } catch (err) {
        console.error("Save Course Error:", err.message);
        res.status(500).json({ message: 'Server Error during save' });
    }
};

exports.getCourses = async (req, res) => {
    try {
        const tenMonthsAgo = new Date();
        tenMonthsAgo.setMonth(tenMonthsAgo.getMonth() - 10);

        const courses = await Course.find({ 
            userId: req.user.id,
            createdAt: { $gte: tenMonthsAgo }
        }).sort({ createdAt: -1 });
        
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
