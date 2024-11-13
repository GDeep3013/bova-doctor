import connectDB from '../../../db/db';
import Product from '../../../models/product';

export async function GET(req) {
  // Ensure database connection
  await connectDB();

  try {
    // Find the product by product_id in the database
    const product = await Product.find();
  
    // Return the product data
    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch product' }), {
      status: 500,
    });
  }
}
