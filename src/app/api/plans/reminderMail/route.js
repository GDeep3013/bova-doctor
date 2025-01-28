import connectDB from '../../../../db/db';
import Plan from '../../../../models/plan';
import Patient from '../../../../models/patient';
import Doctor from '../../../../models/Doctor';
import NextCrypto from 'next-crypto';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';

const getVariants = async (variantIds) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/shopify/products/variants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ variantIds: variantIds }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch variants');
        }

        const data = await response.json();
        return Object.values(data.data).map(variant => ({
            id: parseInt(variant.id.replace('gid://shopify/ProductVariant/', '')),
            title: variant.title,
            price: parseFloat(variant.price),
            sku: variant.sku,
            image: variant.image ? {
                id: parseInt(variant.image.id.replace('gid://shopify/ProductImage/', '')),
                url: variant.image.url,
                altText: variant.image.altText
            } : null,
            product: {
                id: parseInt(variant.product.id.replace('gid://shopify/Product/', '')),
                title: variant.product.title,
                descriptionHtml: variant.product.descriptionHtml,
                images: variant.product.images.edges.map(edge => ({
                    id: parseInt(edge.node.id.replace('gid://shopify/ProductImage/', '')),
                    url: edge.node.url,
                    altText: edge.node.altText
                }))
            }
        }));
    } catch (error) {
        console.error("Error fetching variants:", error);
        return [];
    }
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function GET(req) {
    await connectDB();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const twoDaysAgo = new Date(startOfToday.getTime() - 48 * 60 * 60 * 1000);
    try {
        const pendingPlans = await Plan.find({
            status: 'pending',
            reminderDate: {
                $gte: twoDaysAgo,
                $lt: startOfToday
            }
        }).populate('patient_id');

        const pendingPlanscountDocuments = await Plan.countDocuments({
        status: 'pending',
        reminderDate: {
            $gte: twoDaysAgo,
            $lt: startOfToday
        }
        }).populate('patient_id');

        if (!pendingPlans.length) {
            return new Response(JSON.stringify({ success: true, message: 'No pending plans found.' }), { status: 200 });
        }

        const crypto = new NextCrypto();

        for (const plan of pendingPlans) {
            const { firstName, lastName, email, doctorId } = plan.patient_id;
            const encryptedId = await crypto.encrypt(plan._id.toString());
            const urlSafeEncryptedId = encryptedId.replace(/\//g, '-').replace(/=/g, '_');
            const link = `https://bovalabs.com/pages/view-plans?id=${urlSafeEncryptedId}`;
            const variantIds = plan.items.map(item => item.id);
            const variants = await getVariants(variantIds);
            let createdAt = plan?.createdAt;

            if (createdAt) {
                createdAt = new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }).format(new Date(createdAt));
            }

            const mailData = variants.map(selectedItem => {
                const matchingItem = plan.items.find(item => item.id === selectedItem.id);
                const plainDescription = selectedItem.product.descriptionHtml.replace(/<[^>]*>/g, '').trim();
                return {
                    title: selectedItem.product.title,
                    description: plainDescription,
                    image: selectedItem.product.images?.[0].url || null,
                    properties: matchingItem?.properties || {}
                };
            });


            const doctor = await Doctor.findOne({ _id: doctorId });
            const customProperties = {
                patient_name: `${firstName} ${lastName}`,
                doctor_name: `${doctor?.firstName} ${doctor?.lastName}`,
                doctor_email: doctor?.email,
                doctor_clinic_name: doctor?.clinicName,
                payment_link: link,
                product_details: mailData,
                created_date: createdAt
            };
            plan.reminderDate = now;
            await plan.save();
            const listId = 'Yt5xRh';
            await createProfile(plan?.patient_id, customProperties);
            await subscribeProfiles(plan?.patient_id, listId);

            setTimeout(async () => {
                try {
                    await deleteProfile(plan?.patient_id);
                } catch (error) {
                    console.error('Error deleting profile:', error);
                }
            }, 120000);

            await delay(1000);

        };

        return new Response(JSON.stringify({ success: true, message: `Pending plans processed successfully.${pendingPlanscountDocuments}` }), {
            status: 200
        });
    } catch (error) {
        console.error("Error processing pending plans:", error);
        return new Response(JSON.stringify({ success: false, message: error.message }), {
            status: 500
        });
    }
}

