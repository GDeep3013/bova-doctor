import connectDB from '../../../../db/db';
import Plan from '../../../../models/plan'
import Patient from '../../../../models/patient';
import NextCrypto from 'next-crypto';

export async function POST(req) {
    await connectDB();

    const {
        formData: { items, patient_id, message, discount },
        doctor,
        status = 'pending',
        doctorCommission,
        planStatus = 'saved',
    } = await req.json();


    const planData = {
        patient_id,
        doctorId : doctor.id,
        message,
        status,
        items,
        discount,
        doctorCommission,
        planStatus,
        createdAt: new Date(),
    };

    try {
        // Fetch patient details

        console.log(planData);

        const patient = await Patient.findOne({ _id: patient_id });
        if (!patient) {
            return new Response(JSON.stringify({ success: false, message: "Patient not found" }), { status: 404 });
        }
        const plan = await Plan.create(planData);

        return new Response(JSON.stringify({ success: true, data: plan }), { status: 201 });

    } catch (error) {
        console.error("Error processing request:", error.message);
        return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
    }

}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const encryptedId = searchParams.get('id');
    if (!encryptedId) {
        return new Response(JSON.stringify({ success: false, message: 'Plan ID is required' }), {
            status: 400,
        });
    }
    try {
        // Decrypt the plan ID
        const crypto = new NextCrypto();
        const planId = await crypto.decrypt(encryptedId);

        // Retrieve the plan by its decrypted ID
        const plan = await Plan.findById(planId);

        if (!plan) {
            return new Response(JSON.stringify({ success: false, message: 'Plan not found' }), {
                status: 404,
            });
        }

        return new Response(JSON.stringify({ success: true, data: plan }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: error.message }), {
            status: 500,
        });
    }
}