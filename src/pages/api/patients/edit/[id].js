// pages/api/patients/[id].js

import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { method } = req;
    const { id } = req.query;

    switch (method) {
        case 'GET':
            try {
                const patient = await prisma.patient.findUnique({
                    where: { id: Number(id) },
                });

                if (!patient) {
                    return res.status(404).json({ message: 'Patient not found' });
                }

                return res.status(200).json(patient);
            } catch (error) {
                return res.status(500).json({ message: 'Error fetching patient' });
            }

            case 'PUT':
                try {
                const { id,email, phone, firstName, lastName,doctorId } = req.body;
            
                // Check for existing patient with the same email or phone, excluding the current patient
                const existingPatient = await prisma.patient.findFirst({
                    where: {
                        doctorId: doctorId, // Scope check to the same doctor
                        AND: [
                            { id: { not: Number(id) } }, // Exclude the current patient by ID
                            {
                                OR: [
                                    { email: email }, // Check if the email is already used by another patient of the same doctor
                                    { phone: phone }, // Check if the phone is already used by another patient of the same doctor
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
            
                    const updatedPatient = await prisma.patient.update({
                    where: { id: Number(id) },
                        data: {
                        email, // Assuming you are updating these fields
                            phone,
                            firstName,
                            lastName,
                        },
                    });
            
                    return res.status(200).json(updatedPatient);
                } catch (error) {
                console.error(error); // Log the error for debugging purposes
                    return res.status(500).json({ message: 'Error updating patient' });
                }

        case 'DELETE':
            try {
                await prisma.patient.delete({
                    where: { id: Number(id) },
                });
                return res.status(204).end(); // No content
            } catch (error) {
                return res.status(500).json({ message: 'Error deleting patient' });
            }

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}
