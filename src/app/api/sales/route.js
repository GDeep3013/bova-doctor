import connectDB from '../../../db/db';
import Order from '../../../models/order';
import Patient from '../../../models/patient';
import Plan from '../../../models/plan';

export async function GET(req, { params }) {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const doctorId = searchParams.get('userId');

    try {
        // Fetch total number of patients for the doctor
        const totalPatients = await Patient.countDocuments({ doctorId });

        // Fetch total number of plans for the patients
        const patientIds = await Patient.find({ doctorId }).select('_id');
        const planIds = patientIds.map((patient) => patient._id);

        const totalPlans = await Plan.countDocuments({ patient_id: { $in: planIds } });

        const currentDate = new Date();

        // Calculate start and end of current day
        const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

        // Fetch all orders for the current day using createdAt timestamp
        const dayOrders = await Order.find({
            'doctor.doctor_id': doctorId,
            createdAt: { $gte: startOfDay, $lte: endOfDay }, // Use createdAt field
        });

        const currentDayEarnings = dayOrders.reduce(
            (total, order) => total + (parseFloat(order.total) || 0),
            0
        );

        // Current Week Calculation (Start on Sunday)
        const startOfCurrentWeek = new Date(currentDate);
        startOfCurrentWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Set to Sunday
        startOfCurrentWeek.setHours(0, 0, 0, 0); // Set to start of the day

        const endOfCurrentWeek = new Date(startOfCurrentWeek);
        endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);
        endOfCurrentWeek.setHours(23, 59, 59, 999); 

        const weekOrders = await Order.find({
            'doctor.doctor_id': doctorId,
            createdAt: { $gte: startOfCurrentWeek, $lte: endOfCurrentWeek }, 
        });

        const currentWeekEarnings = weekOrders.reduce(
            (total, order) => total + (parseFloat(order.total) || 0),
            0
        );

        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

        const monthOrders = await Order.find({
            'doctor.doctor_id': doctorId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }, 
        });

        const currentMonthEarnings = monthOrders.reduce(
            (total, order) => total + (parseFloat(order.total) || 0),
            0
        );

        return new Response(
            JSON.stringify({
                totalPatients,
                totalPlans,
                currentDayEarnings,
                currentWeekEarnings,
                currentMonthEarnings,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ message: error.message }),
            { status: 500 }
        );
    }
}
