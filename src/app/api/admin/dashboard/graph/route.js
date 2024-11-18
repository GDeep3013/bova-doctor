import connectDB from '../../../../../db/db';
import Order from '../../../../../models/order';

// Month names array to convert month number to month name
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Get current year
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth(); // Index (0-11) for current month

const getEarningsByTimePeriod = async (timePeriod) => {
    await connectDB();
    const endDate = new Date();
    let startDate;

    // Setting up the date ranges based on the requested time period
    if (timePeriod === 'yearly') {
        // Get earnings for the previous 4 years (not including the current year)
        startDate = new Date(currentYear - 4, 0, 1);
    } else if (timePeriod === 'monthly') {
        // For monthly earnings, we want all months of the current year
        startDate = new Date(currentYear, 0, 1);
    } else if (timePeriod === 'weekly') {
        // For weekly earnings, we just consider the current month
        startDate = new Date(currentYear, currentMonth, 1);
    }

    // Aggregate earnings data from the Order collection
    try {
        const earningsAggregate = await Order.aggregate([
            {
                $match: {
                    order_date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$order_date" },
                        month: { $month: "$order_date" },
                        week: { $week: "$order_date" },
                    },
                    totalRevenue: { $sum: { $toDouble: "$total" } },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 },
            },
        ]);

        // Prepare structured data to hold earnings data
        const structuredData = {};

        if (timePeriod === 'yearly') {
            // Initialize data for the last 4 years
            for (let year = currentYear - 4; year <= currentYear; year++) {
                structuredData[year] = { totalRevenue: 0 };
            }

            // Fill structured data with yearly earnings
            for (const entry of earningsAggregate) {
                const year = entry._id.year;
                if (structuredData[year]) {
                    structuredData[year].totalRevenue += entry.totalRevenue;
                }
            }

            // Prepare final response
            return Object.entries(structuredData).map(([year, data]) => ({
                year: year,
                totalRevenue: data.totalRevenue,
            }));
        } else if (timePeriod === 'monthly') {
            // Initialize data for all months of the current year
            for (let month = 0; month < 12; month++) {
                structuredData[month] = {
                    month: monthNames[month],
                    totalRevenue: 0,
                };
            }

            // Fill structured data with monthly earnings
            for (const entry of earningsAggregate) {
                const month = entry._id.month - 1; // Adjusting month index (0-11)
                structuredData[month].totalRevenue += entry.totalRevenue;
            }

            // Prepare final response for monthly earnings
            return Object.values(structuredData);
        } else if (timePeriod === 'weekly') {
            // Initialize weekly data for the current month
            const weekData = Array(4).fill(0); // Four weeks initialized to 0

            // Fill week data with weekly earnings
            for (const entry of earningsAggregate) {
                const week = entry._id.week - 1; // Adjusting week index (0-3)
                if (week < 4) {
                    weekData[week] += entry.totalRevenue;
                }
            }

            // Prepare final response for weekly earnings
            return weekData.map((revenue, index) => ({
                week: index + 1,
                totalRevenue: revenue,
            }));
        }
    } catch (error) {
        console.error("Error fetching earnings data:", error);
        throw new Error("Failed to fetch earnings data");
    }
};

// Exporting the GET handler
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const timePeriod = searchParams.get("timePeriod");

    if (!timePeriod) {
        return new Response(JSON.stringify({ error: "Time period is required" }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    }

    try {
        const earningsData = await getEarningsByTimePeriod(timePeriod);
        return new Response(JSON.stringify(earningsData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    }
}