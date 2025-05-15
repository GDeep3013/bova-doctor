const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', },
  lineItemId: Number,
  productName: String,
  quantity: Number,
  price: mongoose.Schema.Types.Decimal128
}, { timestamps: true });
const OrderItem = mongoose.models.OrderItem || mongoose.model('OrderItem', orderItemSchema);;
module.exports = OrderItem;
