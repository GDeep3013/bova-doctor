const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_URL = `https://${process.env.SHOPIFY_DOMAIN}/admin/api/2024-10/graphql.json`;


// export async function createDiscountPriceRule(discount, patient) {
//     const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/price_rules.json`;
//     const currentDateTime = new Date().toISOString();
//     const uniqueTitle = `Discount-${patient.firstName}-${Date.now()}`;
//     // try {
//     //     const response = await fetch(url, {
//     //         method: "POST",
//     //         headers: {
//     //             "Content-Type": "application/json",
//     //             "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
//     //         },
//     //         body: JSON.stringify({
//     //             "price_rule": {
//     //                 "title": uniqueTitle,
//     //                 "target_type": "line_item",
//     //                 "target_selection": "all",
//     //                 "allocation_method": "across",
//     //                 "value_type": "percentage",
//     //                 "value": -Number(discount),
//     //                 "customer_selection": "prerequisite",
//     //                 "once_per_customer": true,
//     //                 'prerequisite_customer_ids': [patient.customerId],
//     //                 "starts_at": currentDateTime
//     //             },
//     //         }),
//     //     });

//     //     if (!response.ok) {
//     //         console.error("Error response:", await response.text());
//     //         // throw new Error(
//     //         //     `Shopify API error creating customer: ${response.statusText}`
//     //         // );
//     // //   return new Response(JSON.stringify({ success: false, message: "Patient not found" }), { status: 404 });

//     //         return new Response( JSON.stringify({ error: 'Failed to fetch patients' }), { status: 500 } );
//     //     }
//     //     const data = await response.json();
//     //     return data.price_rule;
//     // } catch (error) {
//     //     console.error("Error creating customer:", error.message);
//     //     throw error;
//     // }
// }





export async function createDiscountPriceRule(discount, patient,variantGIDs) {
    const query = `
      mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
            codeDiscountNode {
              id
              codeDiscount {
                ... on DiscountCodeBasic {
                  title
                  codes(first: 10) {
                    nodes {
                      id
                      code
                    }
                  }
                  startsAt
                  endsAt
                  customerSelection {
                    ... on DiscountCustomerAll {
                      allCustomers
                    }
                  }
                  customerGets {
                    value {
                      ... on DiscountPercentage {
                        percentage
                      }
                    }
                    items {
                      ... on AllDiscountItems {
                        allItems
                      }
                    }
                  }
                  appliesOncePerCustomer
                }
              }
            }
            userErrors {
              field
              code
              message
            }
        }
    }
    `;

    const uniqueTitle = `Discount-${patient.firstName}-${Date.now()}`;
    const variables = {
        basicCodeDiscount: {
            appliesOncePerCustomer: true,
            code: uniqueTitle,
            combinesWith: {
                orderDiscounts: true,
                productDiscounts: true,
                shippingDiscounts: true
            },
            customerGets: {
                appliesOnOneTimePurchase: true,
                appliesOnSubscription: true,
                items: {
                    products: {
                    productVariantsToAdd:variantGIDs
                }
                },
                value: {
                    percentage: discount / 100
                }
            },
            customerSelection: {
                customers: {
                    add: [
                        "gid://shopify/Customer/" + patient.customerId
                    ]
                },
            },
            startsAt: new Date().toISOString(),
            title: uniqueTitle,
            usageLimit: 1
        }
    };

    try {
        const response = await fetch(SHOPIFY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
            },
            body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
            console.error('HTTP error:', response.status, response.statusText);
            throw new Error(`HTTP error ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
            console.error('GraphQL errors:', result.errors);
            throw new Error('Failed to create discount code');
        }

        const { userErrors, codeDiscountNode } = result.data.discountCodeBasicCreate;

        if (userErrors && userErrors.length > 0) {
            console.error('User errors:', userErrors);
            throw new Error(userErrors[0].message);
        }

        console.log('Discount Code Created:', codeDiscountNode, codeDiscountNode?.codeDiscount?.codes?.nodes)
        return codeDiscountNode;
    } catch (error) {
        console.error('Error creating discount code:', error);
        throw error;
    }
}



export async function DeleteDiscountCode(discountCodeId) {
    console.log(discountCodeId)
    const query = `
    mutation discountCodeDelete($id: ID!) {
      discountCodeDelete(id: $id) {
        deletedCodeDiscountId
        userErrors {
          field
          code
          message
        }
      }
    }
  `;
    const variables = {
        id: discountCodeId,
    };

    try {
        const response = await fetch(SHOPIFY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
            },
            body: JSON.stringify({ query, variables }),
        });

        const result = await response.json();

        if (result.data.discountCodeDelete.userErrors.length > 0) {
            console.error('Errors:', result.data.discountCodeDelete.userErrors);
            return {
                success: false,
                errors: result.data.discountCodeDelete.userErrors,
            };
        }

        return {
            success: true,
            deletedCodeDiscountId: result.data.discountCodeDelete.deletedCodeDiscountId,
        };
    } catch (error) {
        console.error('Error deleting discount code:', error);
        return { success: false, error: error.message };
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
                "discount_code": { "code": priceRule.title },
            }),
        });

        if (!response.ok) {
            throw new Error(
                `Shopify API error creating discount: ${response.statusText}`
            );
        }
        const data = await response.json();
        return data.discount_code;
    } catch (error) {
        console.error("Error Creating discount:", error.message);
        throw error;
    }
}


export async function searchCustomer(firstName, lastName, email, phone = null) {
    const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/customers/search.json?query=${email}`;
    try {
        const searchResponse = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
            },
        });
        if (!searchResponse.ok) {
            throw new Error(
                `Shopify API error searching customer: ${searchResponse}`
            );
        }
        const searchData = await searchResponse.json();
        if (searchData.customers && searchData.customers.length > 0) {
            const customer = searchData.customers[0]; // Assuming the first result is the correct customer
            const customerId = customer.id;
            const existingTags = customer.tags ? customer.tags.split(", ") : [];

            if (!existingTags.includes("PATIENT")) {
                // Add the "PATIENT" tag
                const updatedTags = [...existingTags, "PATIENT"].join(", ");
                return await updateCustomer(customerId, firstName, lastName, phone, updatedTags);
            } else {
                return await updateCustomer(customerId, firstName, lastName, phone);
            }
        } else {
            return await createCustomer(firstName, lastName, email, phone);
        }
    } catch (error) {
        console.error("Error searching or updating customer:", error.message);
        throw error;
    }
}
async function createCustomer(firstName, lastName, email, phone = null) {
    const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/customers.json`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
            },
            body: JSON.stringify({
                customer: {
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                    tags: "PATIENT",
                },
            }),
        });

        if (!response.ok) {

            throw new Error(
                `Shopify API error creating customer: ${response.statusText}`
            );
        }
        const data = await response.json();
        return data.customer;
    } catch (error) {
        console.error("Error creating customer:", error.message);
        throw error;
    }
}


async function updateCustomer(customer_id, firstName, lastName, phone = null, updatedTags = null) {
    const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/customers/${customer_id}.json`;
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
            },
            body: JSON.stringify({
                customer: {
                    id: customer_id,
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                    tags: updatedTags,
                },
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            const errors = [];
            if (errorData.errors) {
                if (errorData.errors.phone && errorData.errors.phone.includes('Enter a valid phone number')) {
                    errors.push('Invalid phone number format.');
                }
                if (errorData.errors.email && errorData.errors.email.includes('Email already exists')) {
                    errors.push('Email already exists');
                }
            }
            if (errors.length === 0) {
                errors.push(`Shopify API error updating customer: ${response.statusText}`);
            }

            return Response.json({ error: errors }, { status: 400 });

        }
        const data = await response.json();
        return data.customer;
    } catch (error) {
        console.error("Error Updating customer:", error.message);
        throw error;
    }
}