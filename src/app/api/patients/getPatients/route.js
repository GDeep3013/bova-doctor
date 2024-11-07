import connectDB from '../../../../db/db';
import Patient from '../../../../models/patient';

export async function GET(req) {
  // Connect to the database
  await connectDB();

  // Access query parameters directly from the URL using req.nextUrl
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get('userId'); // Extract userId from query params

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      status: 400,
    });
  }

  try {
    const patients = await Patient.find({ doctorId: userId });
    return new Response(JSON.stringify(patients), {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch patients' }),
      { status: 500 }
    );
  }
}

// Optional: Handle other methods like POST, PUT, etc. if needed
