import connectDB from '../../../../../db/db';
import Order from '../../../../../models/order';

export async function GET(req) {
  await connectDB();
  
  const { searchParams } = req.nextUrl;
  const doctorId = searchParams.get('userId');
  const timePeriod = searchParams.get('timePeriod');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!doctorId || !timePeriod) {
    return new Response(JSON.stringify({ error: 'Doctor ID and time period are required' }), { status: 400 });
  }

  if (timePeriod === 'Custom' && (!startDate || !endDate)) {
    return new Response(JSON.stringify({ error: 'Start date and end date are required for custom time period' }), { status: 400 });
  }

  try {
    let matchCondition = { 'doctor.doctor_id': doctorId };

    // Define date ranges based on the time period
    switch (timePeriod) {
      case 'Year': {
        const currentYear = new Date().getFullYear();
        matchCondition.createdAt = {
          $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
        };
        break;
      }

      case 'Month': {
        const currentDate = new Date();
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        matchCondition.order_date = { $gte: monthStart, $lte: monthEnd };
        break;
      }

      case 'Weeks': {
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        matchCondition.order_date = { $gte: weekStart, $lte: weekEnd };
        break;
      }

      case 'Custom': {
        matchCondition.order_date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid time period.' }), { status: 400 });
    }

    // Use find() to get all the orders for the doctor
    const orders = await Order.find(matchCondition).select('order_date total');

    // Check if orders are found
    if (!orders.length) {
      return new Response(
        JSON.stringify({ error: 'No data found for the given parameters.' }),
        { status: 404 }
      );
    }

    let resultData = [];

    // Process based on time period
    if (timePeriod === 'Year') {
      // Initialize the yearRevenueData with zero revenue for each month
      const currentYear = new Date().getFullYear();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      const yearRevenueData = Array.from({ length: 12 }, (_, index) => ({
        year: currentYear,
        month: monthNames[index], // Convert index to month name
        totalRevenue: 0,
      }));
      
      // Aggregate data by month
      orders.forEach(order => {
        const date = new Date(order.order_date);
        const orderYear = date.getFullYear();
        const orderMonth = date.getMonth(); // 0-indexed (0 = January, 11 = December)

        if (orderYear === 2024) {
          yearRevenueData[orderMonth].totalRevenue += parseFloat(order.total);
        }
      });

      resultData = yearRevenueData;

    } else if (timePeriod === 'Month') {
      // Aggregate data for the current month
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth(); // 0-indexed (0 = January)
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Get total days in the current month
      
      const monthRevenueData = Array.from({ length: daysInMonth }, (_, index) => {
        const date = new Date(currentYear, currentMonth, index + 1); // Create a date for each day of the month
        return {
          day: index + 1,
          date: date.toISOString().split("T")[0], // Format the date as 'YYYY-MM-DD'
          totalRevenue: 0,
        };
      });

      orders.forEach(order => {
        const date = new Date(order.order_date);
        if (date.getMonth() + 1 === currentDate.getMonth() + 1) {
          const dayOfMonth = date.getDate();
          const revenue = parseFloat(order.total);
          monthRevenueData[dayOfMonth - 1].totalRevenue += revenue;
        }
      });

      resultData = monthRevenueData;

    }else if (timePeriod === 'Custom') {
      // Aggregate data for the custom date range
      const customRevenueData = [];

      orders.forEach(order => {
        const date = new Date(order.order_date);
        const dayString = date.toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
        if (date >= new Date(startDate) && date <= new Date(endDate)) {
          const existingData = customRevenueData.find(item => item.day === dayString);
          if (existingData) {
            existingData.totalRevenue += parseFloat(order.total);
          } else {
            customRevenueData.push({
              day: dayString,
              totalRevenue: parseFloat(order.total),
            });
          }
        }
      });

      resultData = customRevenueData;
    }

    return new Response(JSON.stringify(resultData), { status: 200 });

  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch revenue data' }), { status: 500 });
  }
}
