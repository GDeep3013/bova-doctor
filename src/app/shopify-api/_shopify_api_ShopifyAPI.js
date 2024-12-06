const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

console.log(SHOPIFY_DOMAIN, SHOPIFY_ACCESS_TOKEN, "ShopDetails")

export async function createDiscountPriceRule(discount, customerId) {
    const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/price_rules.json`;
    const currentDateTime = new Date().toISOString(); 
    const uniqueTitle = `Discount-${uuidv4()}-${Date.now()}`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
            },
            body: JSON.stringify({
                "price_rule": {
                    "title": uniqueTitle,
                    "target_type": "line_item",
                    "target_selection": "all",
                    "allocation_method": "across",
                    "value_type": "percentage",
                    "value": -Number(discount),
                    "customer_selection": "prerequisite",
                    "once_per_customer": true,
                    'prerequisite_customer_ids': [customerId],
                    "starts_at": currentDateTime
                },
            }),
        });

        if (!response.ok) {
            console.error("Error response:", await response.text());
            throw new Error(
                `Shopify API error creating customer: ${response.statusText}`
            );
        }
        const data = await response.json();
        console.log("PriceRuel", data.price_rule)
        return data.price_rule;
    } catch (error) {
        console.error("Error creating customer:", error.message);
        throw error;
    }
}

export async function createDiscountCode(priceRule) {
    const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/price_rules/${priceRule.id}/discount_codes.json`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
            },
            body: JSON.stringify({
               "discount_code":{"code":priceRule.title},
            }),
        });

        if (!response.ok) {
            throw new Error(
                `Shopify API error creating customer: ${response.statusText}`
            );
        }

        const data = await response.json();
        console.log("discountCode", data.discount_code)
        return data.discount_code;
    } catch (error) {
        console.error("Error creating customer:", error.message);
        throw error;
    }
}
