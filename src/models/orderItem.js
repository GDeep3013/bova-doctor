const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orderId: Number,
  productName: String,
  quantity: Number,
  price: Number
}, { timestamps: true });

module.exports = mongoose.model('OrderItem', orderItemSchema);
