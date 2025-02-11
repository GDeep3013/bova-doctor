import connectDB from '../../../../db/db';
import Plan from '../../../../models/plan';
import Patient from '../../../../models/patient';
import Doctor from '../../../../models/Doctor';
import dayjs from 'dayjs';

import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function processDoctor(doctorUser, customProperties, listId) {
    try {
        // Delete profile if exists before processing
        try {
            await deleteProfile(doctorUser);
            console.log(`Profile deleted for ${doctorUser.email}`);
        } catch (error) {
            console.error(`Error deleting profile for ${doctorUser.email}:`, error);
        }

        // Create profile & Subscribe
        await createProfile(doctorUser, customProperties);
        console.log(`Profile created for ${doctorUser.email}`);

        await subscribeProfiles(doctorUser, listId);
        console.log(`Subscribed ${doctorUser.email} to list ${listId}`);

        // Wait 60 seconds before deleting profile
        await delay(60000);
        try {
            await deleteProfile(doctorUser);
            console.log(`Profile deleted after delay for ${doctorUser.email}`);
        } catch (error) {
            console.error(`Error deleting profile after delay for ${doctorUser.email}:`, error);
        }

        await delay(1000); // Short delay before moving to next doctor
    } catch (error) {
        console.error(`Error processing doctor ${doctorUser.email}:`, error);
    }
}
export async function GET(req) {
    await connectDB();

    const calculateHoursDifference = (createdDate) => {
        const now = dayjs();
        const created = dayjs(createdDate);
        const diffInHours = now.diff(created, 'hour');
        return diffInHours;
    };

    try {
        const allPendingPlans = await Plan.find({
            planStatus: "saved",
            status: "pending",
            discountCode: { $exists: false },
        }).populate('patient_id');

        if (!allPendingPlans.length) {
            return new Response(JSON.stringify({ success: true, message: 'No pending plans found.' }), { status: 200 });
        }

        const pendingPlans = allPendingPlans.filter(plan =>
            calculateHoursDifference(plan.createdAt) == 24
        );

        if (!pendingPlans.length) {
            return new Response(JSON.stringify({ success: true, message: 'No plans  24 hours.' }), { status: 200 });
        }


        for (const plan of pendingPlans) {
            const { firstName, lastName, doctorId } = plan.patient_id;
            const doctor = await Doctor.findOne({ _id: doctorId });
            const doctorUser = {
                email: doctor.email,
                firstName: doctor.firstName,
                lastName: doctor.lastName
            };
            const customProperties = {
                last_name: doctor.lastName,
                patient_name: `${firstName} ${lastName}`,
                login_link: process.env.NEXT_PUBLIC_BASE_URL
            };

            const listId = 'VteAQs';
            await processDoctor(doctorUser, customProperties, listId);
        };
        return new Response(JSON.stringify({ success: true, message: `Pending plans processed successfully.${pendingPlans.length}` }), { status: 200 });
    } catch (error) {
        console.error("Error processing pending plans:", error);
        return new Response(JSON.stringify({ success: false, message: error.message }), {
            status: 500
        });
    }
}