import connectDB from '../../../../db/db';
import Product from '../../../../models/product';

export async function GET(req, { params }) {
  // Ensure database connection
  await connectDB();

  const { id } = params;

  try {
    // Find the product by product_id in the database
    const product = await Product.findOne({ product_id: id });

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 200,
      });
    }

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
