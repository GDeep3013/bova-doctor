import connectDB from '../../../../../../db/db';
import Patient from '../../../../../../models/patient';
import Plan from '../../../../../../models/plan'

export async function PUT(req, { params }) {
    await connectDB();

    const { id } = params;
    const {
        formData: { items, patient_id, message, discount },   
        planStatus = 'saved',       
        doctorCommission }
        = await req.json();
    try {
        const updatedPlan = await Plan.findByIdAndUpdate(
            id,
            { items, patient_id, message, discount, doctorCommission, planStatus, updatedAt: new Date() },
            { new: true }
        ).populate('patient_id');

        const patient = await Patient.findById(patient_id);
        if (!patient) {
            return new Response(JSON.stringify({ success: false, message: "Patient not found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ success: true, data: updatedPlan }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
    }
}
