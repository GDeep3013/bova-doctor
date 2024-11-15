import connectDB from '../../../../db/db';
import Order from '../../../../models/order';
import Patient from '../../../../models/patient';
import Plan from '../../../../models/plan';

export async function GET(req, { params }) {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const doctorId = searchParams.get('userId');

    try {
        // Fetch all patients associated with the doctor
        const patients = await Patient.find({ doctorId });
        const totalPatients = patients.length;

        // Fetch plans for these patients
        const patientIds = patients.map((patient) => patient._id);
        const totalPlans = await Plan.countDocuments({ patient_id: { $in: patientIds } });

        // Fetch data for patients with plan and earnings details
        const patientData = await Promise.all(
            patients.map(async (patient) => {
                const patientPlans = await Plan.find({ patient_id: patient._id });
                const orders = await Order.find({
                    'doctor.doctor_id': doctorId,
                    'patient_id': patient._id,
                });

                const earnings = orders.reduce((total, order) => {
                    return total + (parseFloat(order.total) || 0);
                }, 0);

                return {
                    patient,
                    planCount: patientPlans.length,
                    earnings,
                };
            })
        );


        const top5PatientData = patientData
            .sort((a, b) => b.earnings - a.earnings)
            .slice(0, 5);


        const totalEarnings = patientData.reduce((total, data) => total + data.earnings, 0);


        const weeks = [];
        const weeklyEarnings = [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let weekStart = new Date(currentYear, currentMonth, 1);
        while (weekStart.getMonth() === currentMonth) {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            if (weekEnd.getMonth() !== currentMonth) {
                weekEnd.setDate(0);
            }

            const ordersThisWeek = await Order.find({
                'doctor.doctor_id': doctorId,
                order_date: { $gte: weekStart, $lte: weekEnd },
            });

            weeks.push(
                `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
            );
            weeklyEarnings.push(
                ordersThisWeek.reduce((total, order) => total + (parseFloat(order.total) || 0), 0)
            );

            weekStart.setDate(weekStart.getDate() + 7);
        }

        const months = [];
        const monthlyEarnings = [];
        for (let i = 0; i < 12; i++) {
            const monthStart = new Date(currentYear, currentMonth - i, 1);
            const monthEnd = new Date(
                monthStart.getFullYear(),
                monthStart.getMonth() + 1,
                0,
                23,
                59,
                59,
                999
            );

            const ordersThisMonth = await Order.find({
                'doctor.doctor_id': doctorId,
                order_date: { $gte: monthStart, $lte: monthEnd },
            });

            months.push(
                monthStart.toLocaleString('default', { month: 'short', year: 'numeric' })
            );
            monthlyEarnings.push(
                ordersThisMonth.reduce((total, order) => total + (parseFloat(order.total) || 0), 0)
            );
        }

        const years = [];
        const yearlyEarnings = [];
        for (let i = 0; i < 5; i++) {
            const yearStart = new Date(currentYear - i, 0, 1);
            const yearEnd = new Date(
                yearStart.getFullYear() + 1,
                0,
                0,
                23,
                59,
                59,
                999
            );

            const ordersThisYear = await Order.find({
                'doctor.doctor_id': doctorId,
                order_date: { $gte: yearStart, $lte: yearEnd },
            });

            years.push(`${yearStart.getFullYear()}`);
            yearlyEarnings.push(
                ordersThisYear.reduce((total, order) => total + (parseFloat(order.total) || 0), 0)
            );
        }

        const currentDate = new Date();
        const startOfCurrentWeek = new Date(currentDate);
        startOfCurrentWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the week (Sunday)

        const endOfCurrentWeek = new Date(startOfCurrentWeek);
        endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6); // End of the week (Saturday)

        const currentWeekOrders = await Order.find({
            'doctor.doctor_id': doctorId,
            order_date: { $gte: startOfCurrentWeek, $lte: endOfCurrentWeek },
        });

        const currentWeekEarnings = currentWeekOrders.reduce(
            (total, order) => total + (parseFloat(order.total) || 0),
            0
        );

        // Return response
        return Response.json({
            patientData: top5PatientData,
            totalEarnings,
            totalPatients,
            totalPlans,
            weeklyEarnings,
            monthlyEarnings: monthlyEarnings.reverse(), // From oldest to most recent
            yearlyEarnings: yearlyEarnings.reverse(),
            weeks,
            months: months.reverse(),
            years: years.reverse(),
            currentWeekEarnings:currentWeekEarnings
        });
    } catch (error) {
        console.error('Error:', error);
        return Response.json({ message: error.message }, { status: 500 });
    }
}
