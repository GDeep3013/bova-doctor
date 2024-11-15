

import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import Order from '../../../../models/order';
import Patient from '../../../../models/patient';
import Plan from '../../../../models/plan';
export async function GET() {
    await connectDB();
    try {
        // Fetch the latest 5 doctors
        const doctors = await Doctor.find().limit(5);
        const totalDoctors = await Doctor.countDocuments();
        const totalPatient = await Patient.countDocuments();

        // Calculate the details for each doctor
        const doctorsData = await Promise.all(doctors.map(async (doctor) => {
            const orders = await Order.find({ 'doctor.doctor_id': doctor._id });
            const earnings = orders.reduce((total, order) => total + order.doctor.doctor_payment, 0);
            const totalPatients = await Patient.countDocuments({ doctorId: doctor._id });
            const totalPlans = await Plan.countDocuments({ patient_id: { $in: await Patient.find({ doctorId: doctor._id }) } });

            return {
                id: doctor._id,
                name: `${doctor.firstName} ${doctor.lastName}`,
                patients: totalPatients,
                plans: totalPlans,
                revenue: earnings,
            };
        }));

        // Calculate monthly revenue across all doctors
        const monthlyRevenueData = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$order_date" },
                        month: { $month: "$order_date" }
                    },
                    totalRevenue: { $sum: "$doctor.doctor_payment" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            },
            {
                $project: {
                    year: "$_id.year",
                    month: "$_id.month",
                    totalRevenue: 1,
                    _id: 0
                }
            }
        ]);

        return Response.json({
            doctorsData: doctorsData,
            totalDoctors: totalDoctors,
            totalPatient: totalPatient,
            monthlyRevenueData: monthlyRevenueData
        });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Error fetching doctor and revenue data' });
    }
}