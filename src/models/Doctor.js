// models/Doctor.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, },
    login_token: { type: String, },
    userType: {
        type: String,
        required: true,
        enum: ["Doctor", "Admin"],
        default: "Admin"
    },
    phone: { type: String, },
    specialty: { type: String, },
    clinicName: { type: String },
    commissionPercentage: { type: String, },
    message: { type: String, },
    profileImage: { type: String },
    resetToken: { type: String }, // Token to reset password
    resetTokenExpiry: { type: Date },
    passwordCreatedDate: { type: Date },
    reminderDate: { type: Date, default: Date.now },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    inviteToken: { type: String },

}, { timestamps: true });

doctorSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
