import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import Plan from '../../../../models/plan';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';
import dayjs from 'dayjs';
import NextCrypto from 'next-crypto';
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function klaviyoMail(doctorUser, customProperties, listId) {
    try {

        try {
            await deleteProfile(doctorUser);
            console.log(`Profile deleted for ${doctorUser.email}`);
        } catch (error) {
            console.error(`Error deleting profile for ${doctorUser.email}:`, error);
        }

        await createProfile(doctorUser, customProperties);
        console.log(`Profile created for ${doctorUser.email}`);

        await subscribeProfiles(doctorUser, listId);
        console.log(`Subscribed ${doctorUser.email} to list ${listId}`);


        await delay(60000);
        try {
            await deleteProfile(doctorUser);
            console.log(`Profile deleted after delay for ${doctorUser.email}`);
        } catch (error) {
            console.error(`Error deleting profile after delay for ${doctorUser.email}:`, error);
        }

        await delay(1000);
    } catch (error) {
        console.error(`Error processing doctor ${doctorUser.email}:`, error);
    }
}

export async function GET(req) {
    try {
        await connectDB();
        const allPendingPlans = await Plan.find({
            status: "pending",
            planStatus: "ordered",
            reminderDate: { $exists: true },
        }).populate('patient_id');

        const eightHoursPlans = [];
        const twentyFourHoursPlans = [];
        const calculateHoursDifference = (createdDate) => {
            const now = dayjs();
            const created = dayjs(createdDate);
            const diffInHours = now.diff(created, 'hour');
            return diffInHours;
        };

        allPendingPlans.forEach((Plans) => {
            const timeCalculate = calculateHoursDifference(Plans.reminderDate);
            if (timeCalculate >= 8 && timeCalculate < 9) {
                eightHoursPlans.push(Plans);
            } else if (timeCalculate >= 24 && timeCalculate < 25) {
                twentyFourHoursPlans.push(Plans);
            }
        });

        const crypto = new NextCrypto();

        // 8hrs mail sent        
        for (let plan of eightHoursPlans) {
            const { _id, firstName, lastName, doctorId, email } = plan.patient_id;
            const doctor = await Doctor.findOne({ _id: doctorId });
            const encryptedId = await crypto.encrypt(_id.toString());
            const urlSafeEncryptedId = encryptedId.replace(/\//g, '-').replace(/=/g, '_');
            const link = `https://bovalabs.com/pages/view-plans?id=${urlSafeEncryptedId}`;

            const listId = 'VkpjUr';
            const user = { email: email, firstName: firstName, lastName: lastName }
            const customProperties = {
                doctor_name: doctor.firstName + ' ' + doctor.lastName,
                login_link: link,
                patient_name: firstName + ' ' + lastName
            }

            // console.log(customProperties, listId);
            klaviyoMail(user, customProperties, listId)
        }

        //24 hrs mail sent
        for (let plan of twentyFourHoursPlans) {
            const { _id, firstName, lastName, doctorId, email } = plan.patient_id;
            const doctor = await Doctor.findOne({ _id: doctorId });

            const encryptedId = await crypto.encrypt(_id.toString());
            const urlSafeEncryptedId = encryptedId.replace(/\//g, '-').replace(/=/g, '_');
            const link = `https://bovalabs.com/pages/view-plans?id=${urlSafeEncryptedId}`;

            const listId = 'TDbWMG';
            const user = { email: email, firstName: firstName, lastName: lastName }
            const customProperties = {
                doctor_name: doctor.firstName + ' ' + doctor.lastName,
                login_link: link,
                patient_name: firstName + ' ' + lastName
            }

            klaviyoMail(user, customProperties, listId)
        }

        return new Response(
            JSON.stringify({
                message: "Emails sent successfully",
                eightHoursPlans: eightHoursPlans,
                twentyFourHoursPlans: twentyFourHoursPlans,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error processing request:", error);
        return new Response(
            JSON.stringify({ message: "An error occurred", error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
