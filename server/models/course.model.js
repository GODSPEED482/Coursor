const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    coursePlan: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    skillsMap: {
        type: mongoose.Schema.Types.Mixed,
        required: true 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', CourseSchema);
