// pages/api/patients/[id].js

import connectDB from '../../../../db/db';
import Patient from '../../../../models/patient';

export default async function handler(req, res) {
    connectDB()
    const { method } = req;
    const { id } = req.query;

    switch (method) {
        case 'GET':
            try {
                const patient = await Patient.findById(id);

                if (!patient) {
                    return res.status(404).json({ message: 'Patient not found' });
                }

                return res.status(200).json(patient);
            } catch (error) {
                return res.status(500).json({ message: 'Error fetching patient' });
            }

        case 'PUT':
            try {
                const { email, phone, firstName, lastName, doctorId } = req.body;

                const existingPatient = await Patient.findOne({
                    doctorId: doctorId, // Scope check to the same doctor
                    $and: [
                        { _id: { $ne: id } }, // Exclude the current patient by ID
                        {
                            $or: [
                                { email: email }, // Check if the email is already used by another patient of the same doctor
                                { phone: phone }, // Check if the phone is already used by another patient of the same doctor
                            ]
                        }
                    ]
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

                const updatedPatient = await Patient.findByIdAndUpdate(
                    id,
                    {
                        email,
                        phone,
                        firstName,
                        lastName,
                    },
                    { new: true } // This option returns the updated document
                );
                return res.status(200).json(updatedPatient);
            } catch (error) {
                console.error(error); // Log the error for debugging purposes
                return res.status(500).json({ error: error });
            }

        case 'DELETE':
            try {
                await Patient.findByIdAndDelete(id)
                return res.status(204).end(); // No content
            } catch (error) {
                return res.status(500).json({ error: error });
            }

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}
