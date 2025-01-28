import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';

export async function GET(req) {
  try {
 
    await connectDB();  
  
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const page = parseInt(url.searchParams.get('page') || '1', 30);
    const limit = parseInt(url.searchParams.get('limit') || '30', 30);
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const sortColumn = url.searchParams.get("sortColumn") || "createdAt";
    const skip = (page - 1) * limit;
    const searchQuery = url.searchParams.get('searchQuery') || '';
    const signupStatus = url.searchParams.get('signupStatus') || 'Completed';

        if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400 }
      );
    }
 
    let searchFilter = {
      _id: { $ne: userId },
      userType: "Doctor",
      password: 'Completed' === signupStatus  ? { $exists: true } : { $exists: false },
    };

    // Add search query filtering
      if (searchQuery) {
        searchFilter = {
          ...searchFilter,
        $or: [
          { firstName: { $regex: searchQuery, $options: 'i' } },
          { lastName: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
          { phone: { $regex: searchQuery, $options: 'i' } },
          { commissionPercentage: { $regex: searchQuery, $options: 'i' } },
          { specialty: { $regex: searchQuery, $options: 'i' } }
          ]
        };
      }

    // Fetch doctors based on the filter
    const doctors = await Doctor.find(searchFilter)
      .collation({ locale: 'en', strength: 2 })
      .sort({ [sortColumn]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    // Map doctors to include their signup status
    const doctorsWithSignupStatus = doctors.map((doctor) => ({
      ...doctor.toObject(),
      signupStatus: doctor.password ? 'Completed' : 'Incomplete',
    }));

    const completedCount = await Doctor.countDocuments({
      _id: { $ne: userId },
      userType: "Doctor",
      password: { $exists: true },

    });

    const incompleteCount = await Doctor.countDocuments({
      _id: { $ne: userId },
      userType: "Doctor",
      password: { $exists: false },

    });

    // Count the total number of doctors matching the filter for pagination
    const totalDoctors = await Doctor.countDocuments(searchFilter);

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
        completedCount: completedCount,
        incompleteCount: incompleteCount,

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
