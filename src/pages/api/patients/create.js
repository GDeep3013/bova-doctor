// pages/api/patients.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {


    const { firstName, lastName, email, phone, doctorId } = req.body;

    // Server-side validation
    if (!firstName || !lastName || !email || !doctorId) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    const existingPatient = await prisma.patient.findFirst({
      where: {
        doctorId: doctorId, // Match the same doctorId
        AND: [
         
          {
            OR: [
              { email }, 
              { phone }, 
            ]
          }
        ]
      }
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

    try {
      // Create a new patient in the database associated with the doctor's ID
      const newPatient = await prisma.patient.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          doctorId,
        },
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

