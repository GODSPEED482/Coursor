const mongoose = require("mongoose");

async function run() {
  const uri = "mongodb+srv://neel26ray:Course@cluster0.dorm8ia.mongodb.net/myDB?retryWrites=true&w=majority&appName=Cluster0";

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Mongoose connected to MongoDB Atlas");
    return mongoose;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
}

module.exports = { run };
