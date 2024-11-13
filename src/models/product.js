const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    product_id: { type: Number, required: true },
    sku: { type: String, required: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true } // This will automatically add createdAt and updatedAt fields
);

const Product = mongoose.models.Product ||  mongoose.model('Product', productSchema);

module.exports = Product;
