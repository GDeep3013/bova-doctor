import connectDB from '../../../../db/db';
import Patient from '../../../../models/patient';
import Plan from '../../../../models/plan';
import Order from '../../../../models/order';

export async function GET(req) {
  // Connect to the database
  await connectDB();

  // Access query parameters directly from the URL using req.nextUrl
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get('userId'); // Extract userId (doctorId) from query params
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10); // Default to page 1
  const limit = parseInt(url.searchParams.get('limit') || '10', 10); // Default to 10 items per page
  const skip = (page - 1) * limit;
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      status: 400,
    });
  }

  try {
    // Step 1: Find all patients with the given doctorId
    const patients = await Patient.find({ doctorId: userId }).select('_id').sort({ createdAt: -1 });
    const patientIds = patients.map(patient => patient._id);

    // Step 2: Find all plans where patient_id is in the list of patientIds
    const plans = await Plan.find({ patient_id: { $in: patientIds } }).sort({ createdAt: -1 })
    .sort({ createdAt: -1 })
    .skip(skip)
      .limit(limit).populate('patient_id');
    const totalPlan = await Plan.countDocuments({ patient_id: { $in: patientIds } });
    
    const plansWithOrders = await Promise.all(
      plans.map(async (plan) => {
        const order = await Order.findOne({ plan_id: plan._id }); // Check for an order linked to the plan
        return {
          ...plan.toObject(), // Convert the Mongoose document to a plain JS object
          order: order || null, // Include the order data or null if it doesn't exist
        };
      })
    );

      return new Response(
        JSON.stringify({
          plans: plansWithOrders,
          pagination: {
            total: totalPlan,
            page,
            limit,
            totalPages: Math.ceil(totalPlan / limit),
          },
        }),
        { status: 200 }
      );
    // Respond with the plans data
    // return new Response(JSON.stringify(plans), {
    //   status: 200,
    // });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch plans' }),
      { status: 500 }
    );
  }
}
