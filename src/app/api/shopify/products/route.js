const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Function to fetch inventory levels for a product variant
async function getInventoryLevels(variantId) {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/inventory_levels.json?inventory_item_ids=${variantId}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error fetching inventory levels: ${response.statusText}`);
    }

    const data = await response.json();
    return data.inventory_levels;
  } catch (error) {
    console.error("Error fetching inventory levels:", error.message);
    throw error;
  }
}

// Function to fetch products from Shopify
async function getProducts() {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/products.json`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.products;

    // Check inventory for each product variant
    const productsWithInventory = [];

    for (const product of products) {
      for (const variant of product.variants) {
        const inventoryLevels = await getInventoryLevels(variant.inventory_item_id);

        // If inventory levels exist and are greater than 0, keep the product
        if (inventoryLevels.length > 0 && inventoryLevels[0].available > 0) {
          productsWithInventory.push(product);
          break; // No need to check further variants for this product
        }
      }
    }

    return productsWithInventory;
  } catch (error) {
    console.error("Error fetching products:", error.message);
    throw error;
  }
}

// Explicitly export GET for Next.js API
export async function GET(req) {
  try {
    // Fetch products with inventory check
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
