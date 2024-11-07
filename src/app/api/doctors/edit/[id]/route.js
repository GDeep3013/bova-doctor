import connectDB from '../../../../../db/db';
import Doctor from '../../../../../models/Doctor';

connectDB();

export async function GET(req, { params }) {
    const { id } = params;
    try {
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return new Response(JSON.stringify({ message: 'doctor not found' }), { status: 404 });
        }
        return new Response(JSON.stringify(doctor), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message, message: 'Error fetching doctor' }), { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const { id } = params;
    const { firstName, lastName, email, phone, userType, specialty } = await req.json();
    try {
        const existingDoctor = await Doctor.findOne({
            $or: [
                { email, _id: { $ne: id } },
                { phone, _id: { $ne: id } },
            ],
        });
        if (existingDoctor) {
           const errors = [];
            if (existingDoctor.email === email) errors.push('Email already exists');
            if (existingDoctor.phone === phone) errors.push('Phone number already exists');
            return new Response(JSON.stringify({ error: errors }), { status: 400 });        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            id,
            { firstName, lastName, email, phone, userType, specialty },
            { new: true, runValidators: true }
        );

        return new Response(JSON.stringify(updatedDoctor), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message, message: 'Error updating doctor' }), { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { id } = params;

    try {
        await Doctor.findByIdAndDelete(id);
        return new Response(null, { status: 204 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message, message: 'Error deleting doctor' }), { status: 500 });
    }
}
