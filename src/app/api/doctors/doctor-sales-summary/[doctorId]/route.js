import connectDB from '../../../../../db/db';
import Doctor from '../../../../../models/Doctor';
import Patient from '../../../../../models/patient';
import Plan from '../../../../../models/plan';
import Order from '../../../../../models/order';
import OrderItem from '../../../../../models/orderItem';

export async function GET(req, { params }) {
  await connectDB();
  const { doctorId } = params;
  const search = req.nextUrl.searchParams.get('search')?.toLowerCase() || '';
  const page = parseInt(req.nextUrl.searchParams.get('page')) || 1;
  const limit = parseInt(req.nextUrl.searchParams.get('limit')) || 10;

  try {
    const doctor = await Doctor.findOne({ _id: doctorId, userType: 'Doctor' }).lean();
    if (!doctor) {
      return new Response('Doctor not found', { status: 404 });
    }

    const orders = await Order.find({ 'doctor.doctor_id': doctorId }).lean();
    let doctor_earnings = 0;
    const formattedPlans = [];

    for (const order of orders) {
      const patient = await Patient.findOne({ _id: order.patient_id }).lean();
      const plan = await Plan.findOne({ _id: order.plan_id }).lean();
      if (!patient || !plan) continue;

      doctor_earnings += order?.doctor?.doctor_payment || 0;

      const orderItems = await OrderItem.find({ orderId: order._id }).lean();
      let allItems = [];
        const mappedItems = orderItems.map((item) => {
          const quantity = item.quantity || 0;
            return {
              productName: item.productName || '',
              quantity,
            };
        }).filter((item) => item !== null);
      allItems.push(...mappedItems);

      const planDateStr = new Date(order.order_date).toLocaleDateString('en-GB'); // dd/mm/yyyy
      if (order?.doctor?.doctor_payment <= 0) continue;
      
      formattedPlans.push({
        id: plan._id,
        patient_id: plan.patient_id,
        discount: plan.discount || 0,
        date: order.order_date,
        formattedDate: planDateStr,
        per_item_earning:order?.doctor?.doctor_payment?.toFixed(2) || 0,
        doctorCommission: order?.doctor?.doctor_commission || 0,
        patient: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          doctorId: patient.doctorId,
          items: allItems,
        },
      });
    }

    // Search filter logic (by patient name or plan date)
    const filteredPlans = formattedPlans.filter(plan => {
      const fullName = `${plan.patient.firstName} ${plan.patient.lastName}`.toLowerCase();
      const formattedDate = new Date(plan.date).toLocaleDateString('en-GB'); // dd/mm/yyyy
      return fullName.includes(search) || formattedDate.includes(search);
    });

    // Pagination
    const totalPlans = filteredPlans.length;
    const totalPages = Math.ceil(totalPlans / limit);
    const startIndex = (page - 1) * limit;
    const paginatedPlans = filteredPlans.slice(startIndex, startIndex + limit);

    const result = {
      id: doctor._id,
      doctor_name: `${doctor.firstName} ${doctor.lastName}`,
      email: doctor.email,
      doctor_earnings: parseFloat(doctor_earnings.toFixed(2)),
      plans: paginatedPlans,
      pagination: {
        total: totalPlans,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    return Response.json(result);
  } catch (error) {
    console.error('Error generating doctor report by ID:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
