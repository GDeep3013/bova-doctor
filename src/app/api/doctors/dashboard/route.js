

import connectDB from '../../../../db/db';
import Order from '../../../../models/order';
import Patient from '../../../../models/patient';
import Plan from '../../../../models/plan';

export async function GET(req, { params }) {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const doctorId = searchParams.get('userId');

    try {
        // Find all patients associated with the doctor
        const patients = await Patient.find({ doctorId: doctorId });
        const totalPatients = patients.length;

        // Get all plan documents associated with these patients to calculate total plans
        const patientIds = patients.map(patient => patient._id);
        const totalPlans = await Plan.countDocuments({ patient_id: { $in: patientIds } });

        // For each patient, get the plan count and calculate earnings from orders
        const patientData = await Promise.all(
            patients.map(async (patient) => {
                const patientPlans = await Plan.find({ patient_id: patient._id });

                // Fetch orders for the patient associated with the doctor
                const orders = await Order.find({
                    'doctor.doctor_id': doctorId,
                    'patient_id': patient._id,
                });

                // Calculate total earnings from the `total` field in these orders
                const earnings = orders.reduce((total, order) => {
                    const orderTotal = parseFloat(order.total) || 0; // Safely parse total
                    return total + orderTotal;
                }, 0);

                return {
                    patient,
                    planCount: patientPlans.length,
                    earnings,
                };
            })
        );

        // Sort the patientData by earnings in descending order and take the top 5
        const top5PatientData = patientData
            .sort((a, b) => b.earnings - a.earnings)
            .slice(0, 5);

        // Sum total earnings across all patients
        const totalEarnings = patientData.reduce((total, data) => total + data.earnings, 0);

        // Get earnings by month (for the last 6 months or 12 months, as per your requirement)
        const monthsAgo = 6; // For example, last 6 months (change this to 12 for the last 12 months)
        const currentDate = new Date();
        const months = [];
        const monthlyEarnings = [];

        for (let i = 0; i <= monthsAgo; i++) {
            const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59, 999);

            // Format month for display (e.g., "January 2024")
            const monthLabel = monthStart.toLocaleString('default', { month: 'long', year: 'numeric' });
            months.push(monthLabel);

            // Find orders in this month
            const ordersThisMonth = await Order.find({
                'doctor.doctor_id': doctorId,
                order_date: { $gte: monthStart, $lte: monthEnd }
            });

            // Sum earnings for this month
            const earningsForMonth = ordersThisMonth.reduce((total, order) => {
                const orderTotal = parseFloat(order.total) || 0; // Safely parse total
                return total + orderTotal;
            }, 0);

            monthlyEarnings.push(earningsForMonth);
        }

        // Reverse the arrays to display from January to December
        months.reverse();
        monthlyEarnings.reverse();
        const currentmonthlyEarnings = monthlyEarnings[monthlyEarnings.length - 1]
        // Return the response with all data
        return Response.json({
            patientData: top5PatientData,
            totalEarnings,
            totalPatients,
            totalPlans,
            monthlyEarnings,
            months,
            currentmonthlyEarnings,  // Current month's earnings
        });
    } catch (error) {
        console.error("Error:", error); // Debugging info for errors
        return Response.json({ message: error.message }, { status: 500 });
    }
}
