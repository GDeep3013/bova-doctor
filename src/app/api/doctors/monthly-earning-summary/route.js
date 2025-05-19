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

    // Get start and end of previous month
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Get month name and year for the report
    const month = startOfPrevMonth.toLocaleString('default', { month: 'long' });
    const year = startOfPrevMonth.getFullYear();

    // Fetch plans in previous month and populate patient and doctor
    const plans = await Plan.find({
      createdAt: {
        $gte: startOfPrevMonth,
        $lte: endOfPrevMonth,
      },
    })
      .populate({
        path: 'patient_id',
        populate: {
          path: 'doctorId',
          model: Doctor,
        },
        model: Patient,
      });

    const groupedData = {};

    for (const plan of plans) {
      const doctor = plan.patient_id?.doctorId;
      const doctorId = doctor?._id?.toString();

      if (!doctorId) {
        console.warn(`Skipping plan ${plan._id}: Missing doctorId`);
        continue;
      }

      if (!groupedData[doctorId]) {
        groupedData[doctorId] = {
          doctorId: doctorId,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          email: doctor.email,
          firstName: doctor.firstName,
          lastName:doctor.lastName,
          totalPlans: 0,
          orderedPlans: 0,
          earnings: 0,
          month: month,
          year: year,
        };
      }

      groupedData[doctorId].totalPlans += 1;

      if (plan.status === 'ordered') {
        groupedData[doctorId].orderedPlans += 1;

          const orders = await Order.find({
            plan_id: plan._id,
            order_date: {
            $gte: startOfPrevMonth,
            $lte: endOfPrevMonth,
      }, }).lean();

        for (const order of orders) {
          groupedData[doctorId].earnings += order?.doctor?.doctor_payment || 0;
        }
      }
    }

    const result = Object.values(groupedData);

      for (const doctor of result) { 
           const doctorUser = {
                email: "yogeshrana.610weblab+"+doctor.firstName+"@gmail.com",
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
             
                console.log('doctorUser', doctorUser)
                setTimeout(async () => {
                    await createProfile(doctorUser, customProperties);
                    await subscribeProfiles(doctorUser, listId);
                }, 1000)
                
                // setTimeout(async () => {
                //     try {
                //         await deleteProfile(doctorUser);
                //     } catch (error) {
                //         console.error('Error deleting profile:', error);
                //     }
                // }, 60000);
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
