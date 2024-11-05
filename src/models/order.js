const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: Number,
  order_name: String,
  note: String,
  customer_id: Number,
  customer_name: String,
  customer_email: String,
  item_count: String,
  total: String,
  payment_status: String,
  delivery_status: String,
  delivery_method: String,
  fullfilement: String,
  order_date: Date,
  patientId: Number,
}, { timestamps: true });


const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
module.exports = Order;
