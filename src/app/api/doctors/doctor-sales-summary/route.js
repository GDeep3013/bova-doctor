import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import Patient from '../../../../models/patient';
import Plan from '../../../../models/plan';
import Order from '../../../../models/order'; // Make sure this is imported

export async function GET(req) {
  await connectDB();

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '30');
    const skip = (page - 1) * limit;

    // Fetch all doctors
    const doctors = await Doctor.find({ userType: 'Doctor' }).lean();

    // Fetch all patients
    const patients = await Patient.find({}).lean();

    // Map patients by ID for quick lookup
    const patientMap = {};
    for (const patient of patients) {
      patientMap[patient._id.toString()] = patient;
    }

    // Fetch all 'ordered' plans
    const plans = await Plan.find({ planStatus: 'ordered' }).lean();

    // Prepare doctor summary map
    const doctorSummaryMap = {};

    for (const plan of plans) {
      const patient = patientMap[plan.patient_id?.toString()];
      if (!patient) continue;

      const doctorId = patient.doctorId?.toString();
      if (!doctorId) continue;

      const doctor = doctors.find((d) => d._id.toString() === doctorId);
      if (!doctor) continue;

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
          total_sold: 0,
          total_commission: 0,
          total_patients: 0,
          monthly_summary: {},
          patients: {},
        };
      }

      const summary = doctorSummaryMap[doctorId];

      // Calculate item total
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

      const date = new Date(plan.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!summary.monthly_summary[monthKey]) {
        summary.monthly_summary[monthKey] = {
          total_sold: 0,
          total_commission: 0,
        };
      }

      summary.monthly_summary[monthKey].total_sold += amountPaid;
      summary.monthly_summary[monthKey].total_commission += commissionEarned;

      summary.total_sold += amountPaid;
      summary.total_commission += commissionEarned;

      const patientKey = `${patient.firstName} ${patient.lastName}`;
      if (!summary.patients[patientKey]) {
        summary.patients[patientKey] = {
          patient_name: patientKey,
          payments: [],
        };
        summary.total_patients += 1;
      }

      summary.patients[patientKey].payments.push({
        date: plan.createdAt,
        amount_paid: amountPaid,
        commission_rate: commissionRate,
        commission_earned: commissionEarned,
      });
    }

    // Add earnings (revenue) from Order for each doctor
    const fullData = await Promise.all(
      Object.values(doctorSummaryMap).map(async (summary) => {
        const orders = await Order.find({ 'doctor.doctor_id': summary.id }).lean();
        const earnings = orders.reduce((total, order) => total + parseFloat(order.total || 0), 0);

        return {
          ...summary,
          total_commission: summary.total_commission.toFixed(2),
          patients: Object.values(summary.patients),
          revenue: earnings.toFixed(2),
        };
      })
    );

    const paginatedData = fullData.slice(skip, skip + limit);
    const total = fullData.length;
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
