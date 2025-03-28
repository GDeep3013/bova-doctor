import connectDB from '../../../../db/db';
import Patient from '../../../../models/patient';
import Doctor from '../../../../models/Doctor';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10); // Default to page 1
  const limit = parseInt(searchParams.get('limit') || '10', 10); // Default to 10 items per page
  const skip = (page - 1) * limit;
  try {
    
    const patients = await Patient.find().skip(skip).limit(limit).sort({ createdAt: -1 }).populate('doctorId'); // Populate doctor details
    const totalPatients = await Patient.countDocuments();
    return new Response(
      JSON.stringify({
        data: patients,
        pagination: {
          total: totalPatients,
          page,
          limit,
          totalPages: Math.ceil(totalPatients / limit),
        },
      }),
      { status: 200 }
      );
  } catch (error) {
    console.error('Error fetching patients:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch patients' }),
      { status: 500 }
    );
  }
}
