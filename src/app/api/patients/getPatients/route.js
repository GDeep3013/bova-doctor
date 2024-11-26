import connectDB from '../../../../db/db';
import Patient from '../../../../models/patient';

export async function GET(req) {
  // Connect to the database
  await connectDB();

  // Access query parameters directly from the URL using req.nextUrl
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get('userId');
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10); // Default to page 1
  const limit = parseInt(url.searchParams.get('limit') || '10', 10); // Default to 10 items per page
  const skip = (page - 1) * limit;// Extract userId from query params

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      status: 400,
    });
  }

  try {

    if (url.searchParams.get('page')) {
      const patients = await Patient.find({ doctorId: userId })
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit);
      const totalPatient = await Patient.countDocuments({ doctorId: userId });

      return new Response(
        JSON.stringify({
          patients: patients,
          pagination: {
            total: totalPatient,
            page,
            limit,
            totalPages: Math.ceil(totalPatient / limit),
          },
        }),
        { status: 200 }
      );
    } else {
      const patients = await Patient.find({ doctorId: userId })
        .sort({ createdAt: -1 });

      return new Response(
        JSON.stringify(patients),
        { status: 200 }
      )
      
    }
    
  } catch (error) {
    console.error('Error fetching patients:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch patients' }),
      { status: 500 }
    );
  }
}

// Optional: Handle other methods like POST, PUT, etc. if needed
