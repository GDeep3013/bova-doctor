import connectDB from '../../../db/db';
import Product from '../../../models/product';

export async function GET(req) {
  // Ensure database connection
  await connectDB();
  const status = req.nextUrl.searchParams.get('status');

 
  const filter = status ? { status } : {}; 

  try {
    const product = await Product.find(filter);
  
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
