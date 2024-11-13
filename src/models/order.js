const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: { type: Number, required: true },
  order_name: { type: String, required: true },
  note: { type: String },
  customer_id: { type: Number, required: true },
  customer_name: { type: String, required: null },
  customer_email: { type: String, required: null },
  item_count: { type: String, required: true },
  total: { type: String, required: true },
  payment_status: { type: String, required: null },
  delivery_status: { type: String, required: null },
  delivery_method: { type: String, required: null },
  fulfillment: { type: String, required: null },
  order_date: { type: Date, required: true },
  patient_id: { type: String, default: null },
  doctor: {
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    doctor_payment: { type: Number, required: true }
  }
}, { timestamps: true });


const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
module.exports = Order;
