// api/products/create-update.js

import connectDB from '../../../../db/db';
import Product from '../../../../models/product';

export async function POST(req) {
  await connectDB(); // Connect to MongoDB

  const { product_id, sku, title,variant_id , status } = await req.json();

  try {
    // Update or create a new product with the specified status
    const updatedProduct = await Product.findOneAndUpdate(
      { product_id },
      { product_id, sku, title, status, variant_id },
      { upsert: true, new: true }
    );

    return new Response(JSON.stringify(updatedProduct), { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return new Response(JSON.stringify({ error: 'Failed to update product' }), { status: 500 });
  }
}
