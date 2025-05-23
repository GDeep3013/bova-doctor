const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }, 
  message: String,
  customerId: Number,
}, { timestamps: true });

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
module.exports = Patient;
