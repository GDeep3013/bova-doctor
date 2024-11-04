// pages/api/patients.js
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {


    const { firstName, lastName, email, phone, doctorId } = req.body;

    // Server-side validation
    if (!firstName || !lastName || !email || !doctorId) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    const existingDoctor = await prisma.patient.findFirst({
      where: {
        OR: [{
          email
        },
        {
          phone
        },
        ],
      },
    });

    if (existingDoctor) {
      const errors = [];
      if (existingDoctor.email === email) {
        errors.push('Email already exists');
      }
      if (existingDoctor.phone === phone) {
        errors.push('Phone number already exists');
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


export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}