// models/Doctor.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    specialty: { type: String, required: true },
}, { timestamps: true });

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
