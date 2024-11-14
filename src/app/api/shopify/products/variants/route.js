
const getVariants = async (variantIds) => {
    const shopName = process.env.SHOPIFY_DOMAIN;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  
    // Shopify GraphQL endpoint
    const shopifyApiUrl = `https://${shopName}/admin/api/2024-07/graphql.json`;
  
    // Build the GraphQL query dynamically based on the variantIds array
    let query = "query {\n";
  
    // Ensure variantIds is an array and filter out null or undefined values
    // Filters out null and undefined
  
    variantIds.forEach((variantId, index) => {
      query += `
        productVariant${index + 1}: productVariant(id: "gid://shopify/ProductVariant/${variantId}") {
            id
            title
            price
            sku
            image{
              id
              url
              altText
            }
          
          product {
            id
            title
            images(first:1) {
              edges{
                node {
                  id
                url
                altText
                }
              }
            }
          }
        }\n`;
    });
  
    query += "}\n"; // Closing the query
  
    try {
      // Using fetch to send the request
      const response = await fetch(shopifyApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ query }), // Send the GraphQL query as the body
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching variants: ${response.statusText}`);
      }
  
      // Parse the response data
      const data = await response.json();
      return data; // Return the data from Shopify
    } catch (error) {
      console.error('Error fetching Shopify variants:', error);
      throw error;
    }
  };
  

// Controller function to handle the POST request
export async function POST(req) {
  try {
    // Extract variantIds from the request body (assuming it's an array)
    const { variantIds} = await req.json();

    const validVariantIds = variantIds?.filter(variantId => variantId != null); 

    // Ensure that variantIds is provided and is an array
    if (!Array.isArray(variantIds) || variantIds.length === 0) {
      return new Response(JSON.stringify({ message: 'No variant IDs provided or invalid data.' }), { status: 400 });
    }

    // Fetch variants from Shopify using the provided variant IDs
    const variantData = await getVariants(validVariantIds);

    // Return the fetched variant data in the response
    return new Response(JSON.stringify(variantData), { status: 200 });
  } catch (error) {
    console.error('Error in POST request:', error);
    return new Response(JSON.stringify({ message: 'Error occurred while fetching variants' }), { status: 500 });
  }
}
