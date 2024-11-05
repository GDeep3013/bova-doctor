// pages/api/patients.js
import connectDB from '../../../db/db';
import Patient from '../../../models/patient';

export default async function handler(req, res) {
  if (req.method === 'POST') {

    connectDB()
    const { firstName, lastName, email, phone, doctorId } = req.body;

    // Server-side validation
    if (!firstName || !lastName || !email || !doctorId) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    const existingDoctor = await Patient.findOne({
     OR: [{
          email
        },
        {
          phone
        },
        ],
      
    });

    if (existingDoctor) {
      const errors = [];
      if (existingDoctor.phone === phone) {
        errors.push('Phone number already exists');
      }
      if (existingDoctor.email === email) {
        errors.push('Email already exists');
      }
      return res.status(400).json({ error: errors });
    }

    try {
      // Create a new patient in the database associated with the doctor's ID
      const newPatient = await Patient.create({
          firstName,
          lastName,
          email,
          phone,
          doctorId,
      });

      res.status(201).json({ message: 'Patient created successfully', patient: newPatient });
    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

