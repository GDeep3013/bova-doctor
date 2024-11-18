// On Behalf of Total Earning

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
    return new Response(JSON.stringify({ error: 'Time period is required' }), { status: 400 });
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
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) - 1;
        matchCondition.createdAt = { $gte: monthStart, $lte: new Date(monthEnd) };
        break;
      }
      case 'Custom': {
        matchCondition.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        break;
      }
      default:
        return new Response(JSON.stringify({ error: 'Invalid time period.' }), { status: 400 });
    }

    const orders = await Order.find(matchCondition).select('createdAt total');

    if (orders.length === 0) {
      return new Response(JSON.stringify({ error: 'No data found.' }), { status: 404 });
    }

    let resultData = [];

    if (timePeriod === 'Year') {
      const currentYear = new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString('en-US', { month: 'short' }),
        totalRevenue: 0,
      }));
      orders.forEach(order => {
        const date = new Date(order.createdAt);
        if (date.getFullYear() === currentYear) {
          months[date.getMonth()].totalRevenue += parseFloat(order.total);
        }
      });
      resultData = months;
    } else if (timePeriod === 'Month') {
      const currentDate = new Date();
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => ({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1).toISOString().split('T')[0],
        totalRevenue: 0,
      }));
      orders.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        const day = days.find(d => d.date === date);
        if (day) {
          day.totalRevenue += parseFloat(order.total);
        }
      });
      resultData = days;
    } else if (timePeriod === 'Custom') {
      const dateMap = {};
      let current = new Date(startDate);
      const end = new Date(endDate);

      // Initialize resultData with all dates in the range
      while (current <= end) {
        const formattedDate = current.toISOString().split('T')[0];
        dateMap[formattedDate] = { date: formattedDate, totalRevenue: 0 };
        current.setDate(current.getDate() + 1);
      }

      // Sum revenues into initialized dates
      orders.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        if (dateMap[date]) {
          dateMap[date].totalRevenue += parseFloat(order.total);
        }
      });

      resultData = Object.values(dateMap);
    }

    return new Response(JSON.stringify(resultData), { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}


// On Behalf of Doctor Payment

// import connectDB from '../../../../../db/db';
// import Order from '../../../../../models/order';

// export async function GET(req) {
//   await connectDB();

//   const { searchParams } = req.nextUrl;
//   const doctorId = searchParams.get('userId');
//   const timePeriod = searchParams.get('timePeriod');
//   const startDate = searchParams.get('startDate');
//   const endDate = searchParams.get('endDate');

//   if (!doctorId || !timePeriod) {
//     return new Response(JSON.stringify({ error: 'Time period is required' }), { status: 400 });
//   }

//   if (timePeriod === 'Custom' && (!startDate || !endDate)) {
//     return new Response(JSON.stringify({ error: 'Start date and end date are required for custom time period' }), { status: 400 });
//   }

//   try {
//     let matchCondition = { 'doctor.doctor_id': doctorId };

//     // Define date ranges based on the time period
//     switch (timePeriod) {
//       case 'Year': {
//         const currentYear = new Date().getFullYear();
//         matchCondition.createdAt = {
//           $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
//           $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
//         };
//         break;
//       }
//       case 'Month': {
//         const currentDate = new Date();
//         const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//         const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) - 1;
//         matchCondition.createdAt = { $gte: monthStart, $lte: new Date(monthEnd) };
//         break;
//       }
//       case 'Custom': {
//         matchCondition.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
//         break;
//       }
//       default:
//         return new Response(JSON.stringify({ error: 'Invalid time period.' }), { status: 400 });
//     }

//     // Fetch the orders with the doctor payment details
//     const orders = await Order.find(matchCondition).select('createdAt doctor.doctor_payment');

//     if (orders.length === 0) {
//       return new Response(JSON.stringify({ error: 'No data found.' }), { status: 404 });
//     }

//     let resultData = [];

//     if (timePeriod === 'Year') {
//       const currentYear = new Date().getFullYear();
//       const months = Array.from({ length: 12 }, (_, i) => ({
//         month: new Date(0, i).toLocaleString('en-US', { month: 'short' }),
//         totalRevenue: 0,
//       }));

//       orders.forEach(order => {
//         const date = new Date(order.createdAt);
//         if (date.getFullYear() === currentYear) {
//           // Add doctor payment to the totalRevenue for the respective month
//           months[date.getMonth()].totalRevenue += parseFloat(order.doctor?.doctor_payment || 0);
//         }
//       });

//       resultData = months;
//     } else if (timePeriod === 'Month') {
//       const currentDate = new Date();
//       const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
//       const days = Array.from({ length: daysInMonth }, (_, i) => ({
//         date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1).toISOString().split('T')[0],
//         totalRevenue: 0,
//       }));

//       orders.forEach(order => {
//         const date = new Date(order.createdAt).toISOString().split('T')[0];
//         const day = days.find(d => d.date === date);
//         if (day) {
//           // Add doctor payment to the totalRevenue for the respective day
//           day.totalRevenue += parseFloat(order.doctor?.doctor_payment || 0);
//         }
//       });

//       resultData = days;
//     } else if (timePeriod === 'Custom') {
//       const dateMap = {};
//       let current = new Date(startDate);
//       const end = new Date(endDate);

//       // Initialize resultData with all dates in the range
//       while (current <= end) {
//         const formattedDate = current.toISOString().split('T')[0];
//         dateMap[formattedDate] = { date: formattedDate, totalRevenue: 0 };
//         current.setDate(current.getDate() + 1);
//       }

//       // Sum revenues into initialized dates
//       orders.forEach(order => {
//         const date = new Date(order.createdAt).toISOString().split('T')[0];
//         if (dateMap[date]) {
//           // Add doctor payment to the totalRevenue for the respective date
//           dateMap[date].totalRevenue += parseFloat(order.doctor?.doctor_payment || 0);
//         }
//       });

//       resultData = Object.values(dateMap);
//     }

//     return new Response(JSON.stringify(resultData), { status: 200 });
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
//   }
// }
