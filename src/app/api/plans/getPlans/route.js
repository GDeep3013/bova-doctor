import connectDB from '../../../../db/db';
import Patient from '../../../../models/patient';
import Plan from '../../../../models/plan';

export async function GET(req) {
  // Connect to the database
  await connectDB();

  // Access query parameters directly from the URL using req.nextUrl
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get('userId'); // Extract userId (doctorId) from query params

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      status: 400,
    });
  }

  try {
    // Step 1: Find all patients with the given doctorId
    const patients = await Patient.find({ doctorId: userId }).select('_id');
    const patientIds = patients.map(patient => patient._id);

    // Step 2: Find all plans where patient_id is in the list of patientIds
    const plans = await Plan.find({ patient_id: { $in: patientIds } }).sort({ createdAt: -1 }).populate('patient_id');

    // Respond with the plans data
    return new Response(JSON.stringify(plans), {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch plans' }),
      { status: 500 }
    );
  }
}
