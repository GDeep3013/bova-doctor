import connectDB from '../../../../db/db';
import Order from '../../../../models/order';
import Patient from '../../../../models/patient';
import Plan from '../../../../models/plan';

export async function GET(req) {
    await connectDB();
  
    const { searchParams } = req.nextUrl;
    const doctorId = searchParams.get('userId'); // Doctor ID passed as query param
  
    if (!doctorId) {
      return new Response(JSON.stringify({ error: 'Doctor ID is required' }), { status: 400 });
    }
  
    try {
  
      const patients = await Patient.find({ doctorId });
      const totalPatients = patients.length;
      const patientIds = patients.map((patient) => patient._id);
  
 
      const totalPlans = await Plan.countDocuments({ patient_id: { $in: patientIds } });
  

      const orders = await Order.find({ 'doctor.doctor_id': doctorId }).select('doctor.doctor_payment');
      const totalEarnings = orders.reduce((total, order) => {
        return total + parseFloat(order.doctor.doctor_payment || 0);
      }, 0);
  
    // const orders = await Order.find({ 'doctor.doctor_id': doctorId }).select('total');
    // const totalEarnings = orders.reduce((total, order) => {
    //   return total + parseFloat(order.total || 0);  
    // }, 0);
        
      return new Response(
        JSON.stringify({
          totalEarnings,
          totalPatients,
          totalPlans,
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
  }
