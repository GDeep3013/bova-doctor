import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import Patient from '../../../../models/patient';
import Plan from '../../../../models/plan';
import Order from '../../../../models/order';
import OrderItem from '../../../../models/orderItem';

export async function GET(req) {
  await connectDB();

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '30');
    const skip = (page - 1) * limit;
    const search = url.searchParams.get('search')?.toLowerCase() || '';

    // Fetch ordered plans with populated patient and doctor
    const plans = await Plan.find({ status: 'ordered' })
      .populate({
        path: 'patient_id',
        populate: {
          path: 'doctorId',
          model: 'Doctor',
        },
      })
      .lean();

    const doctorSummaryMap = {};

    for (const plan of plans) {
      const patient = plan.patient_id;
      const doctor = patient?.doctorId;

      if (!doctor) continue;

      const doctorId = doctor._id.toString();

      if (!doctorSummaryMap[doctorId]) {
        doctorSummaryMap[doctorId] = {
          id: doctor._id,
          doctor_name: `${doctor.firstName} ${doctor.lastName}`,
          email: doctor.email,
          phone: doctor.phone,
          joined_date: doctor.createdAt,
          clinicName: doctor.clinicName,
          specialty: doctor.specialty,
          commissionPercentage: doctor.commissionPercentage,
          total_patients: 0,
        };
      }

      // Check if patient already counted
      if (patient) {
        doctorSummaryMap[doctorId].total_patients += 1;
      }
    }

    const fullData = await Promise.all(
      Object.values(doctorSummaryMap).map(async (summary) => {
        const orders = await Order.find({ 'doctor.doctor_id': summary.id }).lean();
        let totalOrderQuantity = 0;
        let earnings = 0;

        for (const order of orders) {
          earnings += order?.doctor?.doctor_payment || 0;
          const orderItems = await OrderItem.find({ orderId: order._id }).lean();
          for (const item of orderItems) {
            totalOrderQuantity += item.quantity || 0;
          }
        }

        return {
          ...summary,
          revenue: earnings.toFixed(2),
          total_quantity_sold: totalOrderQuantity,
          doctor_earnings: earnings,
        };
      })
    );

    // Filter by name or date
    const filteredData = fullData.filter((doctor) => {
      const nameMatch = doctor.doctor_name?.toLowerCase();
      const dateStr = new Date(doctor.joined_date).toLocaleDateString('en-GB').replace(/\//g, '.');
      return nameMatch.includes(search) || dateStr.includes(search);
    });

    // Pagination
    const paginatedData = filteredData.slice(skip, skip + limit);
    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);

    return Response.json({
      data: paginatedData,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error generating doctor report:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
