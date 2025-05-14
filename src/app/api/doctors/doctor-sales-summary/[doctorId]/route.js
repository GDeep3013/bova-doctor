import connectDB from '../../../../../db/db';
import Doctor from '../../../../../models/Doctor';
import Patient from '../../../../../models/patient';
import Plan from '../../../../../models/plan';
import Order from '../../../../../models/order'; // fixed import
import OrderItem from '../../../../../models/orderItem';

export async function GET(req, { params }) {
  await connectDB();
  const { doctorId } = params;

  try {
    // Fetch doctor
    const doctor = await Doctor.findOne({ _id: doctorId, userType: 'Doctor' }).lean();
    if (!doctor) {
      return new Response('Doctor not found', { status: 404 });
    }

    // Get all patients for this doctor
    const patients = await Patient.find({ doctorId }).lean();

    // Map patients for quick access
    const patientMap = {};
    for (const patient of patients) {
      const patientIdStr = patient._id.toString();
      patientMap[patientIdStr] = patient;
    }

    // Get plans for those patients
    const patientIds = Object.keys(patientMap);
    const plans = await Plan.find({
      patient_id: { $in: patientIds },
      planStatus: 'ordered',
    }).lean();

    // Initialize summary
    let totalSold = 0;
    let totalCommission = 0;
    const patientPaymentsMap = {};
    let totalPatients = 0;

    for (const plan of plans) {
      const patient = patientMap[plan.patient_id?.toString()];
      if (!patient) continue;

      // Calculate amounts
      let totalItemAmount = 0;
      for (const item of plan.items) {
        const price = parseFloat(item.price || '0');
        const quantity = item.quantity || 0;
        totalItemAmount += price * quantity;
      }

      const discount = plan.discount || 0;
      const amountPaid = totalItemAmount - discount;
      const commissionRate = plan.doctorCommission || 0;
      const commissionEarned = amountPaid * commissionRate / 100;

      totalSold += amountPaid;
      totalCommission += commissionEarned;

      // Group payments by patient
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

    // Get doctor's orders
    const orders = await Order.find({ 'doctor.doctor_id': doctorId }).lean();
    const doctor_earnings = orders.reduce((total, order) => total + parseFloat(order.total || 0), 0);

    // Build detailed plans array with OrderItem data
    const formattedPlans = [];

    for (const plan of plans) {
      const patient = patientMap[plan.patient_id?.toString()];
      if (!patient) continue;

      const relatedOrders = await Order.find({ plan_id: plan._id }).lean();
      let allItems = [];

      for (const order of relatedOrders) {
        const orderItems = await OrderItem.find({ orderId: order._id }).lean();

        const mappedItems = orderItems.map(item => ({
          productName: item.productName || '',
          quantity: item.quantity || 0,
          price: item.price || 0,
        }));

        allItems.push(...mappedItems);
      }

      formattedPlans.push({
        id: plan._id,
        patient_id: plan.patient_id,
        discount: plan.discount || 0,
        doctorCommission: plan.doctorCommission || 0,
        date: plan.createdAt,
        patient: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          doctorId: patient.doctorId,
          items: allItems,
        },
      });
    }

    // Final result
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
      plans: formattedPlans,
    };

    return Response.json(result);
  } catch (error) {
    console.error('Error generating doctor report by ID:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
