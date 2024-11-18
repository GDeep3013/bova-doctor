

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
            const earnings = orders.reduce((total, order) => total + parseFloat(order.total), 0); // Using 'total' field for income calculation
            const totalPatients = await Patient.countDocuments({ doctorId: doctor._id });
            const totalPlans = await Plan.countDocuments({ patient_id: { $in: await Patient.find({ doctorId: doctor._id }) } });

            return {
                id: doctor._id,
                name: `${doctor.firstName} ${doctor.lastName}`,
                patients: totalPatients,
                plans: totalPlans,
                revenue: earnings, // Total income from orders
            };
        }));

        // Get the last 6 months including the current month
        const currentDate = new Date();
        const lastSixMonths = Array.from({ length: 6 }).map((_, index) => {
            const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - index);
            return { 
                monthName: month.toLocaleString('default', { month: 'short' }), // Jan, Feb, Mar...
                year: month.getFullYear(),
                month: month.getMonth() + 1 // 1-12 for months
            };
        }).reverse(); // Ensure months are in correct order (latest to oldest)

        // Initialize the values array for graph
        const months = lastSixMonths.map(item => item.monthName);
        const values = new Array(6).fill(0); // Default all months to 0

        // Calculate monthly revenue across all doctors for the last 6 months including current month
        const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const monthlyRevenueData = await Order.aggregate([
            {
                $match: {
                    order_date: { 
                        $gte: new Date(new Date().setMonth(currentDate.getMonth() - 6)), // Match orders in the last 6 months including current
                        $lte: currentMonthEnd
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$order_date" },
                        month: { $month: "$order_date" }
                    },
                    totalRevenue: { $sum: { $toDouble: "$total" } } // Sum of the 'total' income field
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

        // Map monthly revenue data to match the months array
        monthlyRevenueData.forEach(data => {
            const monthIndex = lastSixMonths.findIndex(item => item.month === data.month && item.year === data.year);
            if (monthIndex !== -1) {
                values[monthIndex] = data.totalRevenue;
            }
        });

        // Get current month's earnings
        const currentMonthEarnings = monthlyRevenueData.find(m => m.year === currentDate.getFullYear() && m.month === currentDate.getMonth() + 1)?.totalRevenue || 0;

        return Response.json({
            doctorsData: doctorsData,
            totalDoctors: totalDoctors,
            totalPatient: totalPatient,
            graphMonth: months,
            graphValue: values,
            currentMonthEarnings: currentMonthEarnings, 
        });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Error fetching doctor and revenue data' });
    }
}