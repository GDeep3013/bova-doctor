const mongoose = require('mongoose');
import connectDB from '../../../../../db/db';
import Order from '../../../../../models/order';
import OrderItem from '../../../../../models/orderItem';
import Patient from '../../../../../models/patient';
import Doctor from '../../../../../models/Doctor';
import Plan from '../../../../../models/plan';
import { logger } from "../../../../../../logger";

function getPropertyValue(properties, key) {
  if (!properties || !Array.isArray(properties)) return null;
  const prop = properties.find(p => p.name === key);
  return prop ? prop.value : null;
}

export async function POST(req) {
  await connectDB(); // Connect to MongoDB

  try {
    const orderData = await req.json(); // Parse incoming JSON data

    logger.info('Shopify Create and Update Webhook Triggered', {
      orderID: orderData.id
    });

    const mainPatientId = orderData?.line_items
      .map(item => getPropertyValue(item.properties, "_patient_id"))
      .find(value => value != null) || null;
    const planId = orderData.line_items
      .map(item => getPropertyValue(item.properties, "_plan_id"))
      .find(value => value != null) || null;

    let DrcommissionAmount = 0;
    let doctCommission = 0;

    const patient = await Patient.findById(mainPatientId);

    const plan = await Plan.findById(planId);

    const hasSubscription = orderData?.tags?.split(',').map(tag => tag.trim()).includes('Subscription');
    const SubscriptionFirstOrder = orderData?.tags?.split(',').map(tag => tag.trim()).includes('Subscription First Order');
    const SubscriptionRecurringOrder = orderData?.tags?.split(',').map(tag => tag.trim()).includes('Subscription Recurring Order');

    // const totalPrice = orderData.line_items.reduce((sum, item) => {
    //   const price = parseFloat(item.price) || 0;
    //   const quantity = parseInt(item.quantity) || 1;
    //   return sum + price * quantity;
    // }, 0);
    const totalPrice = parseFloat(orderData?.total_price);

        const doctor = await Doctor.findById(plan?.doctorId);
      

        doctCommission = doctor.commissionPercentage;
      
        if (hasSubscription && SubscriptionFirstOrder) {
          if (plan.discount > 0) {
            doctCommission  = doctor.commissionPercentage - plan.discount;
          }
        } else if (hasSubscription && SubscriptionRecurringOrder) {
          doctCommission = 20;
        } else {
            if (plan.discount > 0) {
              doctCommission  = doctor.commissionPercentage - plan.discount;
            }
        }
       DrcommissionAmount = (totalPrice * doctCommission) / 100;
    

    if (planId) {
      const savedOrder = await Order.findOneAndUpdate({
        order_id: orderData.id
      }, {
        order_id: orderData.id,
        order_name: orderData.name,
        note: orderData.note,
        customer_id: orderData.customer.id,
        customer_name: `${orderData.customer.first_name} ${orderData.customer.last_name}`,
        customer_email: orderData.customer.email,
        item_count: orderData.line_items.length,
        total: totalPrice?.toFixed(2), // updated to use manually calculated total
        payment_status: orderData.financial_status,
        delivery_status: orderData.fulfillment_status || "pending",
        delivery_method: orderData.shipping_lines[0]?.title || "Not Specified",
        fulfillment: orderData.fulfillment_status || "unfulfilled",
        order_date: new Date(orderData.created_at),
        patient_id: mainPatientId,
        plan_id: planId,
        tags: orderData.tags,
        doctor: {
          doctor_id: doctor?._id,
          doctor_payment: DrcommissionAmount,
          doctor_commission: doctCommission
        }
      }, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      });

      for (const item of orderData.line_items) {
        const itemPatientId = getPropertyValue(item.properties, "_patient_id") || mainPatientId;
        await OrderItem.findOneAndUpdate({
          orderId: savedOrder._id,
          lineItemId: item.id,
        }, {
          orderId: savedOrder._id,
          lineItemId: item.id,
          productName: item.title,
          quantity: item.quantity,
          price: mongoose.Types.Decimal128.fromString(item.price)
        }, {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        });
      }

      if (planId) {
        await Plan.findByIdAndUpdate(planId, {
          status: "ordered"
        }, {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        });
      }
    }

    return new Response(JSON.stringify({
      message: 'Order and items saved successfully'
    }), {
      status: 201
    });

  } catch (error) {
    console.error('Error saving order and items:', error);
    logger.error('Webhook Error', error);
    return new Response(JSON.stringify({
      message: 'Failed to save order and items'
    }), {
      status: 500
    });
  }
}
