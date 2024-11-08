// /src/app/api/shopify/products/route.js

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Function to fetch products from Shopify
async function getProducts() {
    const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/products.json`;
  
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN, // Ensure this is set in .env file
        }
      });
  
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.statusText}`);
      }
  
      // Parse the response JSON
      const data = await response.json();
      return data.products; // Adjust this based on your response structure
  
    } catch (error) {
      console.error("Error fetching products:", error.message);
      throw error; // Re-throw error to handle it in the calling function if needed
    }
  }
// Explicitly export GET for Next.js API
export async function GET(req) {
  try {
    // Fetch products using the helper function
      const products = await getProducts();
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle errors in the response
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
