// src/app/api/patients/create/route.js
import connectDB from '../../../../db/db';  // Adjust path based on your folder structure
import Patient from '../../../../models/patient';

export async function POST(req, res) {
  if (req.method === 'POST') {
    await connectDB();  // Ensure the database is connected

    const { firstName, lastName, email, phone, doctorId } = req.body;

    // Server-side validation
    if (!firstName || !lastName || !email || !doctorId) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    try {
      // Check if a patient already exists with the same email or phone for the same doctor
      const existingPatient = await Patient.findOne({
        doctorId,  // Ensure it's for the same doctor
        $or: [
          { email: email }, // Check if the email already exists for this doctor
          { phone: phone },  // Check if the phone already exists for this doctor
        ],
      });

      if (existingPatient) {
        const errors = [];
        if (existingPatient.phone === phone) {
          errors.push('Phone number already exists');
        }
        if (existingPatient.email === email) {
          errors.push('Email already exists');
        }
        return res.status(400).json({ error: errors });
      }

      // Create a new patient in the database associated with the doctor's ID
      const newPatient = await Patient.create({
        firstName,
        lastName,
        email,
        phone,
        doctorId,
      });

      // Return success message
      res.status(201).json({ message: 'Patient created successfully', patient: newPatient });

    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
