// lib/cronJobs.js
const cron = require('node-cron');
const Plan = require('./src/models/plan')
const Patient = require('./src/models/patient')
const Doctor = require('./src/models/Doctor')
const NextCrypto = require('next-crypto');
const connectDB = require('./src/db/db')
require('dotenv').config();
const { createProfile, subscribeProfiles, deleteProfile } = require('./src/app/klaviyo/klaviyo');

const crypto = new NextCrypto();

const getVariants = async (variantIds) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/shopify/products/variants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ variantIds: variantIds }),
        });

        if (!response.ok) {
            throw new Error('Failed to update status');
        }
        const data = await response.json();
        const variants = Object.values(data.data).map(variant => ({
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
        return variants;
    } catch (error) {
        console.error("Error updating product status:", error);
    }
};


async function checkPendingPlans() {
    connectDB()
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate the start of two days ago
    const twoDaysAgo = new Date(startOfToday.getTime() - 48 * 60 * 60 * 1000);

    // Query to match only dates
    const pendingPlans = await Plan.find({
        status: 'pending',
        createdAt: {
            $gte: twoDaysAgo, // 00:00:00 of two days ago
            $lt: startOfToday // Before 00:00:00 of today
        }
    }).populate('patient_id');



    const emailPromises = pendingPlans.length > 0 && pendingPlans.map(async (plan) => {
        const { firstName, lastName, email, doctorId } = plan?.patient_id;
        const encryptedId = await crypto.encrypt(plan._id.toString());

        // Make the encrypted ID URL-safe by replacing `/` and `=` characters
        const urlSafeEncryptedId = encryptedId
            .replace(/\//g, '-')  // Replace `/` with `-`
            .replace(/\=/g, '_'); // Replace `=` with `_`

        const link = `https://bovalabs.com/pages/view-plans?id=${urlSafeEncryptedId}`;
        const variantIds = plan?.items.map(item => item.id);
        let variants = await getVariants(variantIds)
        const mailData = variants.map(selectedItem => {
            const matchingItem = plan?.items.find(item => item.id === selectedItem.id);
            const plainDescription = selectedItem.product.descriptionHtml.replace(/<[^>]*>/g, '').trim();
            return {
                title: selectedItem.product.title,
                description: plainDescription,
                image: selectedItem.product.images?.[0].url || null,
                properties: matchingItem?.properties || {},

            };
        });

        const doctor = await Doctor.findOne({ _id: doctorId })
        // console.log(doctor);
        const customProperties = {
            patient_name: firstName + ' ' + lastName,
            doctor_name: doctor.firstName + ' ' + doctor.lastName,
            doctor_email: doctor.email,
            doctor_clinic_name: doctor.clinicName,
            payment_link: link,
            product_details: mailData,
        };

        const listId = 'Yt5xRh';
        const patient = plan?.patient_id;
        const createProfilePromise = await createProfile(patient, customProperties);

        const subscribeProfilePromise = await subscribeProfiles(patient, listId);

        setTimeout(async () => {
            try {
                await deleteProfile(patient);
            } catch (error) {
                console.error('Error deleting profile:', error);
            }
        }, 120000);
        setTimeout(async () => {
            try {
                await deleteProfile(patient);
            } catch (error) {
                console.error('Error deleting profile:', error);
            }
        }, 120000);
        const [createResponse, subscribeResponse] = await Promise.all([
            createProfilePromise,
            subscribeProfilePromise,
        ]);
    });

}

checkPendingPlans();
// Schedule the job to run every hour
// 
cron.schedule('0 * * * *', async () => {
    console.log('Checking for pending plans...');
    await checkPendingPlans();
});