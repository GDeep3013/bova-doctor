

import connectDB from '../../../../db/db';
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
            
            // Correctly calculate earnings by parsing the total as a float
            const earnings = orders.reduce((total, order) => total + parseFloat(order.total), 0);
            
            const totalPatients = await Patient.countDocuments({ doctorId: doctor._id });
            const totalPlans = await Plan.countDocuments({ patient_id: { $in: await Patient.find({ doctorId: doctor._id }) } });

            return {
                id: doctor._id,
                name: `${doctor.firstName} ${doctor.lastName}`,
                patients: totalPatients,
                plans: totalPlans,
                revenue: earnings, // Total revenue for the doctor
            };
        }));

        // Get current date and calculate the last 7 months including the current month
        const currentDate = new Date();
        const monthsAgo = 6; // Last 7 months including current month
        const startDate = new Date(currentDate.setMonth(currentDate.getMonth() - monthsAgo));

        // Prepare the array of all 7 months (including the current month)
        const allMonths = [];
        for (let i = 0; i <= 6; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);
            const monthName = date.toLocaleString('default', { month: 'long' }); // Full month name
            const year = date.getFullYear();
            allMonths.push(`${monthName}-${year}`); // Format as Month-YYYY
        }

        // Aggregate revenue for the last 7 months
        const monthlyRevenueData = await Order.aggregate([
            {
                $match: {
                    order_date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$order_date" },
                        month: { $month: "$order_date" }
                    },
                    totalRevenue: { 
                        $sum: { $toDouble: "$total" } // Convert total (string) to number
                    }
                }
            },
            {
                $sort: { "_id.year": -1, "_id.month": -1 } // Sort in descending order by year and month
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

        // Create a map of the months with the corresponding revenue data
        const revenueMap = new Map();
        monthlyRevenueData.forEach(item => {
            const monthLabel = `${item.month}-${item.year}`;
            revenueMap.set(monthLabel, item.totalRevenue);
        });

        // Fill in any missing months with a revenue of 0
        const months = [];
        const revenue = [];
        allMonths.forEach(monthLabel => {
            months.push(monthLabel);
            revenue.push(revenueMap.get(monthLabel) || 0); // If no data, set revenue as 0
        });

        return Response.json({
            doctorsData: doctorsData,
            totalDoctors: totalDoctors,
            totalPatient: totalPatient,
            months: months, // Sorted months array
            revenue: revenue // Corresponding revenue data, with missing months as 0
        });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Error fetching doctor and revenue data' });
    }
}
