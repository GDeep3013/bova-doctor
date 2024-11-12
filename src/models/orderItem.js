const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', },
  productName: String,
  quantity: Number,
  price: Number
}, { timestamps: true });
const OrderItem = mongoose.models.OrderItem || mongoose.model('OrderItem', orderItemSchema);;
module.exports = OrderItem;
