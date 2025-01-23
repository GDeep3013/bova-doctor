import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';

import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';

export async function GET(req) {
    await connectDB();
    const doctors = await Doctor.find({
        password: { $exists: false },
        login_token: { $exists: true }
    });
    // return new Response(doctors, { status: 200 })

    const currentTime = new Date();
    const eightHoursDoctors = [];
    const twentyFourHoursDoctors = [];

    doctors.forEach(doctor => {
        const createdDate = new Date(doctor.createdAt);
        console.log("Created Date:", createdDate.toISOString()); // Log in ISO format (UTC)
        console.log("Current Date:", currentTime.toISOString()); // Log in ISO format (UTC)
        
        // Calculate the time difference in hours
        const timeDifference = (currentTime.getTime() - createdDate.getTime()) / (1000 * 60 * 60); // Difference in hours
        
        console.log("Time Difference in hours:", timeDifference);
        // Check if time difference is between 8 and 24 hours
        if (timeDifference >= 7.9 && timeDifference < 8) {
            // console.log(`Doctor ${doctor.email} completed 8 hours. Sending email...`);
            sendKlaviyoEmail(doctor.email, "8-hours-email-flow");
        } else if (timeDifference >= 23.9 && timeDifference < 24) {
            // console.log(`Doctor ${doctor.email} completed 24 hours. Sending email...`);
            sendKlaviyoEmail(doctor.email, "24-hours-email-flow");
        } else {
            // console.log(`Doctor ${doctor.email} is not eligible for an email flow at this time.`);
        }
    });


    for (let doctor of eightHoursDoctors) {
        await sendKlaviyoEmail(doctor.email, "8-hours-email-flow");
    }

    for (let doctor of twentyFourHoursDoctors) {
        await sendKlaviyoEmail(doctor.email, "24-hours-email-flow");
    }

    console.log("Doctors within 8 hours:", eightHoursDoctors);
    console.log("Doctors within 24 hours:", twentyFourHoursDoctors);

    // Return a success response
    return new Response(eightHoursDoctors, { status: 200 });
}

