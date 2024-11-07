import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';

export async function GET(req) {
  try {
    // Ensure the database connection is established first
    await connectDB();

    // Extract userId from the query string in the URL
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    // If no userId is provided, return an error response
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required', userId: userId }),
        { status: 400 }
      );
    }

    // Fetch doctors excluding the one with the given userId
    const doctors = await Doctor.find({ _id: { $ne: userId } });

    // Return the list of doctors
    return new Response(JSON.stringify(doctors), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
