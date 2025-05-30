import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import Order from '../../../../models/order';
import Patient from '../../../../models/patient';
import Plan from '../../../../models/plan';

export async function GET() {
    await connectDB();

    try {

        const allDoctors = await Doctor.find({ userType: "Doctor" });

        const doctorEarningsData = await Promise.all(
            allDoctors.map(async (doctor) => {
                const orders = await Order.find({ 'doctor.doctor_id': doctor._id });
                let earnings = 0;
                for (const order of orders) {
                earnings += order?.doctor?.doctor_payment || 0;
              }
                const totalPatients = await Patient.countDocuments({ doctorId: doctor._id });
                const totalPlans = await Plan.countDocuments({
                    patient_id: { $in: await Patient.find({ doctorId: doctor._id }).distinct('_id') },
                });

                return {
                    id: doctor._id,
                    name: `${doctor.firstName} ${doctor.lastName}`,
                    patients: totalPatients,
                    plans: totalPlans,
                    revenue: earnings,
                };
            })
        );
        const totalItemCount = await Order.aggregate([
            {
                $group: {
                    _id: null, // No grouping key, summing across all documents
                    totalItems: { $sum: { $toInt: "$item_count" } } // Convert item_count to integer and sum
                }
            }
        ]);

        const units = totalItemCount[0]?.totalItems || 0; // If no documents, total is 0

        const topEarningDoctors = doctorEarningsData
            .sort((a, b) => {
                if (b.revenue !== a.revenue) {
                    return b.revenue - a.revenue; // Sort by revenue first
                } else if (b.plans !== a.plans) {
                    return b.plans - a.plans; // If revenue is same, sort by plans
                } else {
                    return b.patients - a.patients; // If plans are also same, sort by patients
                }
            })
            .slice(0, 10);

        const totalDoctors = await Doctor.countDocuments({ userType: "Doctor" });
        const totalPatient = await Patient.countDocuments();
        const doctorsSignedIn = await Doctor.countDocuments({
            password: { $exists: true, $ne: '' },
            userType: "Doctor"
        });

        const inviteSent = await Doctor.countDocuments({
            password: { $exists: false },
            resetToken: { $exists: true },
            userType: "Doctor"
        });

        // Get the last 6 months including the current month
        const currentDate = new Date();
        const lastSixMonths = Array.from({ length: 6 }).map((_, index) => {
            const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - index);
            return {
                monthName: month.toLocaleString('default', { month: 'short' }), // Jan, Feb, Mar...
                year: month.getFullYear(),
                month: month.getMonth() + 1, // 1-12 for months
            };
        }).reverse();

        const months = lastSixMonths.map((item) => item.monthName);
        const values = new Array(6).fill(0);

        const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const monthlyRevenueData = await Order.aggregate([
            {
                $match: {
                    order_date: {
                        $gte: new Date(new Date().setMonth(currentDate.getMonth() - 6)),
                        $lte: currentMonthEnd,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$order_date' },
                        month: { $month: '$order_date' },
                    },
                    totalRevenue: { $sum: { $toDouble: '$total' } },
                },
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 },
            },
            {
                $project: {
                    year: '$_id.year',
                    month: '$_id.month',
                    totalRevenue: 1,
                    _id: 0,
                },
            },
        ]);

        // Map monthly revenue data to match the months array
        monthlyRevenueData.forEach((data) => {
            const monthIndex = lastSixMonths.findIndex((item) => item.month === data.month && item.year === data.year);
            if (monthIndex !== -1) {
                values[monthIndex] = data.totalRevenue;
            }
        });

        // Get current month's earnings
        const currentMonthEarnings =
            monthlyRevenueData.find(
                (m) => m.year === currentDate.getFullYear() && m.month === currentDate.getMonth() + 1
            )?.totalRevenue || 0;

        return Response.json({
            unitSolds:units,
            doctorsSignedIn: doctorsSignedIn,
            inviteSent:inviteSent,
            doctorsData: topEarningDoctors,
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
