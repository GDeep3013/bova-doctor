// pages/api/doctors/[id].js

import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { method } = req;
    const { id } = req.query;

    switch (method) {
        case 'GET':
            try {
                const doctor = await prisma.doctor.findUnique({
                    where: { id: Number(id) },
                });

                if (!doctor) {
                    return res.status(404).json({ message: 'doctor not found' });
                }

                return res.status(200).json(doctor);
            } catch (error) {
                return res.status(500).json({  error:error, message: 'Error fetching doctor' });
            }

            case 'PUT':
                try {
                    const {
                        id,
                        firstName,
                        lastName,
                        email,
                        phone,
                        userType,
                        specialty,
                    } = req.body;
            
                    // Check for existing doctor with the same email or phone, excluding the current doctor
                    const existingDoctor = await prisma.doctor.findFirst({
                        where: {
                            OR: [
                                { email: email, NOT: { id: Number(id) } }, // Check for email uniqueness, excluding the current doctor
                                { phone: phone, NOT: { id: Number(id) } }, // Check for phone uniqueness, excluding the current doctor
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

                    const updatedDoctor = await prisma.doctor.update({
                        where: { id: Number(id) },
                        data: {
                            firstName,
                            lastName,
                            email,
                            phone,
                            userType,
                            specialty,
                        },
                    });
            
                    return res.status(200).json(updatedDoctor);
                } catch (error) {
                    console.error(error); // Log the error for debugging purposes
                    return res.status(500).json({  error:error, message: 'Error updating doctor' });
                }

        case 'DELETE':
            try {
                await prisma.doctor.delete({
                    where: { id: Number(id) },
                });
                return res.status(204).end(); // No content
            } catch (error) {
                return res.status(500).json({ error:error,message: 'Error deleting doctor' });
            }

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}
