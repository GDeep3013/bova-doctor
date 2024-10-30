// pages/api/patients.js
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Get the user's session
        const session = await getSession({ req });

        // Check if the user is logged in and retrieve doctorId
        if (!session || !session.user || !session.user.id) {
            return res.status(401).json({ error: 'Unauthorized: No user session found', session:session });
        }

        const doctorId = session.user.id; // Assuming doctorId is stored in session.user

        const { firstName, lastName, email, phone } = req.body;

        // Server-side validation
        if (!firstName || !lastName || !email || !doctorId) {
            return res.status(400).json({ error: 'Required fields are missing' });
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