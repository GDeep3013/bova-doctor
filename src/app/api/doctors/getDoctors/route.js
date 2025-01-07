import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';

export async function GET(req) {
  try {
    // Ensure the database connection is established first
    await connectDB();

    // Extract userId, page, and limit from the query string in the URL
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const page = parseInt(url.searchParams.get('page') || '1', 30); // Default to page 1
    const limit = parseInt(url.searchParams.get('limit') || '30', 30); // Default to 10 items per page
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'; 
    const sortColumn = url.searchParams.get("sortColumn") || "createdAt";
    const skip = (page - 1) * limit;

    // If no userId is provided, return an error response
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400 }
      );
    }

    // Fetch doctors excluding the one with the given userId, and apply pagination
    const doctors = await Doctor.find({
      _id: { $ne: userId },
      userType: "Doctor"
    })
    .sort({ [sortColumn]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);
    const doctorsWithSignupStatus = doctors.map((doctor) => ({
      ...doctor.toObject(),
      signupStatus: doctor.password ? 'Completed' : 'Incomplete',
    }));
    const totalDoctors = await Doctor.countDocuments({ _id: { $ne: userId } });

    // Return the list of doctors along with pagination info
    return new Response(
      JSON.stringify({
        data: doctorsWithSignupStatus,
        pagination: {
          total: totalDoctors,
          page,
          limit,
          totalPages: Math.ceil(totalDoctors / limit),
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
