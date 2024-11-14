// models/Doctor.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, },
    userType: { 
        type: String, 
        required: true, 
        enum: ["Doctor", "Admin"], 
        default: "Admin"                    
    },
    phone: { type: String, required: true, unique: true },
    specialty: { type: String, required: true },
    clinicName: { type: String},
    commissionPercentage: { type: String, required: true },
    message: { type: String,  },
    profileImage: { type: String }, 
    resetToken: { type: String }, // Token to reset password
    resetTokenExpiry: { type: Date },
}, { timestamps: true });

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
