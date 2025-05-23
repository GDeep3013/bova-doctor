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

      if (!plan) continue;
    const hasSubscription = order?.tags?.split(',').map(tag => tag.trim()).includes('Subscription');
    const SubscriptionFirstOrder = order?.tags?.split(',').map(tag => tag.trim()).includes('Subscription First Order');
      const SubscriptionRecurringOrder = order?.tags?.split(',').map(tag => tag.trim()).includes('Subscription Recurring Order');
      let patient_discount = 0;

      if (SubscriptionRecurringOrder) {
        patient_discount = 0;
      } else {
        patient_discount = plan.discount || 0;
      }

      let order_type2 = "One Time";
      if (SubscriptionFirstOrder) {
        order_type2 = 'Subscription';
      } else if (SubscriptionRecurringOrder) {
        order_type2 = 'Recurring';
      }else {
        order_type2 = "One Time";
      }

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
      // if (order?.doctor?.doctor_payment <= 0) continue;
      let patient_name = patient?.firstName + '' + patient?.lastName
      formattedPlans.push({
        id: plan._id,
        order_type: order_type2,
        order_number:order.order_name,
        patient_id: plan.patient_id,
        discount: patient_discount || 0,
        date: order.order_date,
        order_total: order.total,
        formattedDate: planDateStr,
        per_item_earning:order?.doctor?.doctor_payment?.toFixed(2) || 0,
        doctorCommission: order?.doctor?.doctor_commission || 0,
        patient: {
          firstName: patient?.firstName,
          customer_name: patient? patient?.firstName + ' ' + patient?.lastName: order?.customer_name,
          email: patient?.email,
          doctorId: patient?.doctorId,
          items: allItems,
        },
      });
    }
     formattedPlans.sort((a, b) => {
      const numA = parseInt(a.order_number.replace('#', ''), 10);
      const numB = parseInt(b.order_number.replace('#', ''), 10);
      return numA - numB; // descending
    });

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
