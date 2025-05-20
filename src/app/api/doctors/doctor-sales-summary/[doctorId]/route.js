import connectDB from '../../../../../db/db';
import Doctor from '../../../../../models/Doctor';
import Patient from '../../../../../models/patient';
import Plan from '../../../../../models/plan';
import Order from '../../../../../models/order'; // fixed import
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

    const patients = await Patient.find({ doctorId }).lean();

    const patientMap = {};
    for (const patient of patients) {
      const patientIdStr = patient._id.toString();
      patientMap[patientIdStr] = patient;
    }

    const patientIds = Object.keys(patientMap);
    const plans = await Plan.find({
      patient_id: { $in: patientIds },
      planStatus: 'ordered',
    }).lean();

    let totalSold = 0;
    let totalCommission = 0;
    const patientPaymentsMap = {};
    let totalPatients = 0;

    for (const plan of plans) {
      const patient = patientMap[plan.patient_id?.toString()];
      if (!patient) continue;

      let totalItemAmount = 0;
      for (const item of plan.items) {
        const price = parseFloat(item.price || '0');
        const quantity = item.quantity || 0;
        totalItemAmount += price * quantity;
      }

      const discount = plan.discount || 0;
      const amountPaid = totalItemAmount - discount;
      const commissionRate = plan.doctorCommission || 0;
      const commissionEarned = (amountPaid * commissionRate) / 100;

      totalSold += amountPaid;
      totalCommission += commissionEarned;

      const patientKey = `${patient.firstName} ${patient.lastName}`;
      if (!patientPaymentsMap[patientKey]) {
        patientPaymentsMap[patientKey] = {
          patient_name: patientKey,
          payments: [],
        };
        totalPatients += 1;
      }

      patientPaymentsMap[patientKey].payments.push({
        date: plan.createdAt,
        amount_paid: amountPaid,
        commission_rate: commissionRate,
        commission_earned: commissionEarned,
      });
    }

    const orders = await Order.find({ 'doctor.doctor_id': doctorId }).lean();
    let doctor_earnings = 0;

    for (const order of orders) {
      doctor_earnings += order?.doctor?.doctor_payment || 0;
    }

    const formattedPlans = [];

    for (const plan of plans) {
      const patient = patientMap[plan.patient_id?.toString()];
      if (!patient) continue;

      const relatedOrders = await Order.find({ plan_id: plan._id }).lean();
      let allItems = [];
      let doctorCommission = 0;

      for (const order of relatedOrders) {
        const orderItems = await OrderItem.find({ orderId: order._id }).lean();
        const hasSubscription = order?.tags?.split(',').map(tag => tag.trim()).includes('Subscription');
         const SubscriptionFirstOrder = order?.tags?.split(',').map(tag => tag.trim()).includes('Subscription First Order');
         const SubscriptionRecurringOrder = order?.tags?.split(',').map(tag => tag.trim()).includes('Subscription Recurring Order');

        const mappedItems = orderItems.map((item) => {
          const price = item.price || 0;
          const quantity = item.quantity || 0;
          const totalPrice = order?.total;
          const discount = (totalPrice * (plan.discount || 0)) / 100;

          let per_item_earning = 0;
          if (hasSubscription && SubscriptionFirstOrder) {
            doctorCommission = 15;
            per_item_earning = (totalPrice * doctorCommission) / 100;
          } else if (hasSubscription && SubscriptionRecurringOrder) {
            doctorCommission = 0;
            per_item_earning = (totalPrice * doctorCommission) / 100;
          } else {
            doctorCommission = doctor.commissionPercentage || 0;
            per_item_earning = (totalPrice * doctorCommission) / 100 - discount;
          }

          if (doctorCommission > 0) {
            return {
              productName: item.productName || '',
              quantity,
              price,
              per_item_earning: parseFloat(per_item_earning.toFixed(2)),
              doctorCommission: doctorCommission
            };
          }
          return null;
        }).filter((item) => item !== null);

        allItems.push(...mappedItems);
      }

      const planDateStr = new Date(plan.createdAt).toLocaleDateString('en-GB'); // "dd/mm/yyyy"

      formattedPlans.push({
        id: plan._id,
        patient_id: plan.patient_id,
        discount: plan.discount || 0,
        doctorCommission: doctorCommission || 0,
        date: plan.createdAt,
        formattedDate: planDateStr,
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
      return (
        fullName.includes(search) ||
        formattedDate.includes(search)
      );
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
      phone: doctor.phone,
      clinicName: doctor.clinicName,
      specialty: doctor.specialty,
      commissionPercentage: doctor.commissionPercentage,
      total_sold: totalSold,
      total_commission: totalCommission.toFixed(2),
      total_patients: totalPatients,
      doctor_earnings: doctor_earnings,
      patients: Object.values(patientPaymentsMap),
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

