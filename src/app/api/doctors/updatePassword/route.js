
import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import bcrypt from 'bcryptjs';

connectDB();

export async function PUT(req, { params }) {
   
    const { id, password } = await req.json();
    try {
        const currentDoctor = await Doctor.findById(id);

        if (!currentDoctor) {
            return new Response(JSON.stringify({ error: 'Doctor not found' }), { status: 404 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        currentDoctor.password = hashedPassword;
        await currentDoctor.save();

        return new Response(JSON.stringify({ status: true, message: 'Password updated successfully' }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message, message: 'Error updating password' }), { status: 500 });
    }
}