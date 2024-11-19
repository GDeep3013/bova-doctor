// db.js
const mongoose = require('mongoose');

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/doctor_app';

const connectDB = async () => {
    try {
        await mongoose.connect(DATABASE_URL,{
            dbName:process.env.MONGODB_DB_NAME
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
