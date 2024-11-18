import connectDB from '../../../../db/db';

import Order from '../../../../models/order';
const getEarningsByTimePeriod = async (timePeriod) => {
    await connectDB();
    const currentDate = new Date();
    let startDate;

    // Determine the start date based on the time period
    switch (timePeriod) {
        case 'weekly':
            // Get the start of the current week (last 7 days)
            startDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
            break;
        case 'monthly':
            // Get the start of the current month
            startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
            break;
        case 'yearly':
            // Get the start of the current year
            startDate = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
            break;
        default:
            // Default to yearly if no valid time period is passed
            startDate = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
            break;
    }

    // Aggregate earnings data from the Order collection
    try {
        const earningsData = await Order.aggregate([
            {
                $match: {
                    order_date: { $gte: startDate },  // Filter orders after the calculated startDate
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$order_date" },
                        month: { $month: "$order_date" },
                        week: { $week: "$order_date" },
                    },
                    totalEarnings: { $sum: { $toDouble: "$total" } }, // Convert total to a number
                },
            },
            {
                $sort: { "_id.year": -1, "_id.month": -1, "_id.week": -1 },  // Sort by year, month, week
            },
        ]);

        return earningsData;
    } catch (error) {
        console.error("Error fetching earnings data:", error);
        throw new Error("Failed to fetch earnings data");
    }
};

// API Route handler
export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { timePeriod } = req.query; // Get timePeriod from query params

        if (!timePeriod) {
            return res.status(400).json({ error: "Time period is required" });
        }

        try {
            // Fetch earnings data based on timePeriod
            const earningsData = await getEarningsByTimePeriod(timePeriod);
           return Response.json(earningsData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        return Response.json({ error: "Method Not Allowed" });
    }
}
