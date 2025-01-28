import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';
import dayjs from 'dayjs';

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function GET(req) {
    try {
    await connectDB();
    const doctors = await Doctor.find({
        password: { $exists: true },
    });

    const twentyFourHoursDoctors = [];
    const calculateHoursDifference = (createdDate) => {
        const now = dayjs();
        const created = dayjs(createdDate);
        const diffInHours = now.diff(created, 'hour');
        return diffInHours;
    };

    doctors.forEach((doctor) => {
        const timeCalculate = calculateHoursDifference(doctor?.passwordCreatedDate);
        if (timeCalculate >= 24 && timeCalculate < 25) {
            twentyFourHoursDoctors.push(doctor);
        }
    })

    for (let doctor of twentyFourHoursDoctors) {
        try {
            const doctorUser = { email: doctor.email, firstName: doctor.firstName, lastName: doctor.lastName };
            
            const customProperties = {
                firstName: doctor.firstName,
                lastName: doctor.lastName,
            };

            const listId = 'SwGDpn';

            try {
                setTimeout(async () => {
                    try {
                        const deleteProfileResponse = await deleteProfile(doctorUser);
                    } catch (error) {
                        console.error('Error deleting profile:', error);
                    }
                }, 60000);

                await createProfile(doctorUser, customProperties);                
                await subscribeProfiles(doctorUser, listId);

                setTimeout(async () => {
                    try {
                        const deleteProfileResponse = await deleteProfile(doctorUser);
                    } catch (error) {
                        console.error('Error deleting profile:', error);
                    }
                }, 60000);
                await delay(1000);
            } catch (error)
             {
                console.error('Error processing doctor:', email, error);
             }
        } catch (error) {
            console.error(`Failed to send email to ${doctor.email}:`, error);
        }
    }
    return new Response(
        JSON.stringify({
            message: "Emails sent successfully",
            twentyFourHoursDoctors: twentyFourHoursDoctors,
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
