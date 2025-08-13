const mongoose = require("mongoose");
const Lesson = require("./Lesson.model");
const moduleSchema = new mongoose.Schema({
    title : {
        type : String,
        required: true
    },
    description : {
        type : String,
    },
    lessons : Lesson.schema, 
})

const Moodule = mongoose.model("Module", moduleSchema);
module.exports = Moodule;
        