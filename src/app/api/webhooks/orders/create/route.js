import connectDB from '../../../../../db/db';
import Order from '../../../../../models/order';
import OrderItem from '../../../../../models/orderItem';
import Patient from '../../../../../models/patient';
import Doctor from '../../../../../models/Doctor';
import Plan from '../../../../../models/plan';


export async function POST(req) {
  await connectDB(); // Connect to MongoDB

  try {
    const orderData = await req.json(); // Parse incoming JSON data
    
    // Find the _patient_id from the first line item that has it, or default to null
    const mainPatientId = orderData.line_items.find(item => item.properties?._patient_id)?.properties._patient_id || null;
    const planId = orderData.line_items.find(item => item.properties?._plan_id)?.properties._plan_id || null;


    let doctorPayment = 0;

    const patient = await Patient.findById(mainPatientId)
    const plan = await Plan.findById(planId)
   
    if (patient.doctorId) {
      const doctor = await Doctor.findById(patient.doctorId)
      if (doctor) {
        const totalPrice = parseFloat(orderData.total_price);
        const discount = (totalPrice * plan.discount) / 100;
        const doctorCommission = totalPrice * (doctor.commissionPercentage / 100) - discount;
        doctorPayment = doctorCommission
      }
    }

    // Create a new order document with the mainPatientId
    const newOrder = new Order({
      order_id: orderData.id,
      order_name: orderData.name,
      note: orderData.note,
      customer_id: orderData.customer.id,
      customer_name: `${orderData.customer.first_name} ${orderData.customer.last_name}`,
      customer_email: orderData.customer.email,
      item_count: orderData.line_items.length,
      total: orderData.total_price,
      payment_status: orderData.financial_status,
      delivery_status: orderData.fulfillment_status || "pending",
      delivery_method: orderData.shipping_lines[0]?.title || "Not Specified",
      fulfillment: orderData.fulfillment_status || "unfulfilled",
      order_date: new Date(orderData.created_at),
      patient_id: mainPatientId,
      doctor: {
        doctor_id: patient ? patient.doctorId : null, 
        doctor_payment: doctorPayment 
      }
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();

    // Map through line_items to save each as an OrderItem, using the main patientId if individual item _patient_id is absent
    const orderItems = orderData.line_items.map(item => {
      const itemPatientId = item.properties?._patient_id || mainPatientId; // Check _patient_id in item properties

      return {
        orderId: savedOrder._id,        // Reference the saved order's ID
        productName: item.title,
        quantity: item.quantity,
        price: item.price,
      };
    });

    // Save all OrderItems to the database
    await OrderItem.insertMany(orderItems);
    await Plan.findByIdAndUpdate(planId, { status: "completed" }, { new: true })
    return new Response(JSON.stringify({ message: 'Order and items saved successfully' }), { status: 201 });

  } catch (error) {
    console.error('Error saving order and items:', error);
    return new Response(JSON.stringify({ message: 'Failed to save order and items' }), { status: 500 });
  }
}
