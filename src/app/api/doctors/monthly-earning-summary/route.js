import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import Patient from '../../../../models/patient';
import Plan from '../../../../models/plan';
import Order from '../../../../models/order';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET(req) {
  await connectDB();

  try {
    const now = new Date();

    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const month = startOfPrevMonth.toLocaleString('default', { month: 'long' });
    const year = startOfPrevMonth.getFullYear();

    // Fetch all plans in the previous month
    const plans = await Plan.find({
      createdAt: {
        $gte: startOfPrevMonth,
        $lte: endOfPrevMonth,
      },
    })
      .populate('doctorId')
      .lean();

    const groupedData = {};

    for (const plan of plans) {
      const doctor = plan?.doctorId;
      const doctorId = doctor?._id?.toString();

      if (!doctorId) continue;

      if (!groupedData[doctorId]) {
        groupedData[doctorId] = {
          doctorId: doctorId,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          email: doctor.email,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          totalPlans: 0,
          orderedPlans: 0,
          earnings: 0,
          month,
          year,
        };
      }

      groupedData[doctorId].totalPlans += 1;

      if (plan.status === 'ordered') {
        groupedData[doctorId].orderedPlans += 1;
      }
    }
    const orders = await Order.find({
      order_date: {
        $gte: startOfPrevMonth,
        $lte: endOfPrevMonth,
      },
    }).lean();

    for (const order of orders) {
      const doctorId = order?.doctor?.doctor_id?.toString();

      if (doctorId && groupedData[doctorId]) {
        groupedData[doctorId].earnings += order?.doctor?.doctor_payment || 0;
      }
    }

    const result = Object.values(groupedData);

   
    for (const doctor of result) {
      const doctorUser = {
        email: doctor.email,
        firstName: doctor.firstName,
        lastName: doctor.lastName
      };

      const customProperties = {
        doctor_name: doctor.doctorName,
        month: doctor.month,
        year: doctor.year,
        plans_out: doctor.totalPlans,
        plans_purchased: doctor.orderedPlans,
        total_earnings: doctor?.earnings?.toFixed(2),
      };

      const listId = 'Rk4Mpk';

      try {
        await deleteProfile(doctorUser);
        setTimeout(async () => {
          await createProfile(doctorUser, customProperties);
          await subscribeProfiles(doctorUser, listId);
        }, 1000);

        await delay(1000);
      } catch (error) {
        console.error('Error processing doctor:', doctor.email, error);
      }
    }

    return new Response(JSON.stringify({ data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating doctor report:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
