const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
    title : {
        type : String,
        required: true
    },
    description : {
        type : String,
    }
})

const Moodule = mongoose.model("Module", moduleSchema);
module.exports = Moodule;
        