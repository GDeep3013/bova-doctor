// pages/api/register.js
import bcrypt from 'bcrypt';
import connectDB from '../../db/db';
import Doctor from '../../models/Doctor';

connectDB(); // Connect to the database

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { firstName, lastName, email, password, phone, specialty } = req.body;

            const existingDoctor = await Doctor.findOne({ 
                $or: [{ email }, { phone }] 
            });

            if (existingDoctor) {
                const errors = [];
                if (existingDoctor?.email === email) {
                    errors?.push('Email already exists');
                }
                if (existingDoctor?.phone === phone) {
                    errors?.push('Phone number already exists');
                }
                return res.status(400).json({ error: errors });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newDoctor = await Doctor.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone,
                userType:"Admin",
                specialty,
            });

            const { password: _, ...doctorData } = newDoctor.toObject();
            return res.status(201).json(doctorData);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: error });
        }
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
}
