// pages/api/suggestions.js
import { NextResponse } from 'next/server'; // Optional for Next.js 13+ (using app directory)

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  const shopName = process.env.SHOPIFY_DOMAIN;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;


  // Construct the URL
  const url = `https://${shopName}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[options][fields]=author,product_type,tag,title,variants.sku,variants.title,vendor`;

  try {
    // Fetch the suggestion data
    const response = await fetch(url);
    const data = await response.json();
  
    console.log('Suggestion Response', { response: data, type: typeof data, url });
  
    // Extract the products from the response
    const results = data.resources?.results?.products ?? []; // Directly access the products results
  
    // Return the final results as JSON
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch search results' }),
      { status: 500 }
    );
  }
}
