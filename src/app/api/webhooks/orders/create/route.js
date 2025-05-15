import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/db/db';
import Order from '@/models/order';
import OrderItem from '@/models/orderItem';
import Patient from '@/models/patient';
import Doctor from '@/models/Doctor';
import Plan from '@/models/plan';
import { logger } from '@/logger';

export async function POST(req) {
  try {
    const secret = process.env.SHOPIFY_SECRET_KEY;

    // Read raw body for HMAC verification
    const rawBody = await req.text();
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');

    // Validate HMAC
    const hash = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    if (hash !== hmacHeader) {
      logger.warn('❌ Invalid Shopify webhook HMAC');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    logger.info('✅ Shopify Webhook Verified');

    await connectDB();

    const orderData = JSON.parse(rawBody);
    logger.info('📦 Shopify Order Data Received', { orderId: orderData.id });

    const mainPatientId =
      orderData.line_items.find(item => item.properties?._patient_id)?.properties._patient_id || null;
    const planId =
      orderData.line_items.find(item => item.properties?._plan_id)?.properties._plan_id || null;

    let doctorPayment = 0;

    const patient = await Patient.findById(mainPatientId);
    const plan = await Plan.findById(planId);

    if (patient?.doctorId && plan) {
      const doctor = await Doctor.findById(patient.doctorId);
      if (doctor) {
        const totalPrice = parseFloat(orderData.total_price);
        const discount = (totalPrice * plan.discount) / 100;
        const doctorCommission = totalPrice * (doctor.commissionPercentage / 100) - discount;
        doctorPayment = doctorCommission;
      }
    }

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
      delivery_status: orderData.fulfillment_status || 'pending',
      delivery_method: orderData.shipping_lines?.[0]?.title || 'Not Specified',
      fulfillment: orderData.fulfillment_status || 'unfulfilled',
      order_date: new Date(orderData.created_at),
      patient_id: mainPatientId,
      plan_id: planId,
      doctor: {
        doctor_id: patient?.doctorId || null,
        doctor_payment: doctorPayment,
      },
    });

    const savedOrder = await newOrder.save();

    const orderItems = orderData.line_items.map(item => ({
      orderId: savedOrder._id,
      productName: item.title,
      quantity: item.quantity,
      price: item.price,
    }));

    await OrderItem.insertMany(orderItems);

    if (planId) {
      await Plan.findByIdAndUpdate(planId, { status: 'ordered' }, { new: true });
    }

    logger.info('✅ Order and items saved successfully');
    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error) {
    logger.error('❌ Error handling Shopify webhook', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
