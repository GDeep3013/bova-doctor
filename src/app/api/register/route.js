// src/app/api/register/route.js
import bcrypt from 'bcrypt';
import connectDB from '../../../db/db';
import Doctor from '../../../models/Doctor';

// Connect to the database
connectDB();

export async function POST(req) {
    try {
        const { firstName, lastName, email, password, phone, specialty ,commissionPercentage} = await req.json();

        const existingDoctor = await Doctor.findOne({ 
            $or: [{ email }, { phone }] 
        });

        if (existingDoctor) {
            const errors = [];
            if (existingDoctor?.email === email) {
                errors.push('Email already exists');
            }
            if (existingDoctor?.phone === phone) {
                errors.push('Phone number already exists');
            }
            return new Response(JSON.stringify({ error: errors }), { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newDoctor = await Doctor.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            userType: "Admin",
            specialty,
            commissionPercentage
        });

        const { password: _, ...doctorData } = newDoctor.toObject();
        return new Response(JSON.stringify(doctorData), { status: 201 ,message:'New user created successfully'});
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}

// Optionally handle non-POST methods (but it's better to let Next.js handle this in the default 405 error)
export async function OPTIONS() {
    return new Response('Method Not Allowed', { status: 405 });
}
