const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('[Server] MongoDB Connected successfully');
    } catch (err) {
        console.error('[Server] MongoDB Connection Failed:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
