const mongoose = require("mongoose");
const LessonSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    content : {
            type: mongoose.Schema.Types.Mixed,
         required: true
    }
})

const Lesson = mongoose.model("Lesson", LessonSchema);
module.exports = Lesson;