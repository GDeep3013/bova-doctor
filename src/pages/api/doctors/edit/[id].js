// pages/api/doctors/[id].js

import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';

export default async function handler(req, res) {
    connectDB()
    const { method } = req;
    const { id } = req.query;

    switch (method) {
        case 'GET':
            try {
                const doctor = await Doctor.findById(id);

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
                        firstName,
                        lastName,
                        email,
                        phone,
                        userType,
                        specialty,
                    } = req.body;
        
                    // Check for existing doctor with the same email or phone, excluding the current doctor
                    const existingDoctor = await Doctor.findOne({
                        $or: [
                            { email: email, _id: { $ne: id } }, // Check for email uniqueness, excluding the current doctor
                            { phone: phone, _id: { $ne: id } }, // Check for phone uniqueness, excluding the current doctor
                        ],
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
        
                    // Update the doctor information
                    const updatedDoctor = await Doctor.findByIdAndUpdate(
                        id,
                        {
                            firstName,
                            lastName,
                            email,
                            phone,
                            userType,
                            specialty,
                        },
                        { new: true, runValidators: true } // Return the updated document and apply validators
                    );
        
                    return res.status(200).json(updatedDoctor); // Return the updated doctor
                } catch (error) {
                    console.error(error); // Log the error for debugging purposes
                    return res.status(500).json({ error: error.message, message: 'Error updating doctor' });
                }
        case 'DELETE':
            try {
                await Doctor.findByIdAndDelete(id)
                return res.status(204).end(); // No content
            } catch (error) {
                return res.status(500).json({ error:error,message: 'Error deleting doctor' });
            }

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}
