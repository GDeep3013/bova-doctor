import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function convertToIST(date) {
    // Convert UTC to IST (UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    return new Date(date.getTime() + istOffset);
}

function getISTHours(date) {
    // Convert the provided date to IST
    const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    return istDate.getHours();
}
export async function GET(req) {
    try {
        await connectDB();
        const doctors = await Doctor.find({
            password: { $exists: false },
            login_token: { $exists: true }
        });

        const eightHoursDoctors = [];
        const twentyFourHoursDoctors = [];

        doctors.forEach((doctor) => {
            const currentIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const currentISTHour = currentIST.getHours();
            // Convert user creation date to IST
            const userCreatedDate = new Date(doctor.createdAt);
            const userCreatedISTHour = getISTHours(userCreatedDate);
            let hourDifference = currentISTHour - userCreatedISTHour;
            if (hourDifference >= 8 && hourDifference < 9) {
                eightHoursDoctors.push(doctor);
            } else if (hourDifference >= 0 && hourDifference < 1) {
                twentyFourHoursDoctors.push(doctor);
            }
        })


        // 8hrs mail sent
        // for (let doctor of eightHoursDoctors) {
        //     try {
        //         const confirmationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/doctor-confirmation?token=${doctor.login_token}`;
        //         const doctorUser = { email: doctor.email, firstName: doctor.firstName, lastName: doctor.lastName };
        //         const listId = 'VRe747';
        //         const customProperties = {
        //             firstName: doctor.firstName,
        //             lastName: doctor.lastName,
        //             login_link: confirmationLink
        //         };
        //         try {
        //             setTimeout(async () => {
        //                 try {
        //                     const deleteProfileResponse = await deleteProfile(doctorUser);
        //                 } catch (error) {
        //                     console.error('Error deleting profile:', error);
        //                 }
        //             }, 60000);

        //             await createProfile(doctorUser, customProperties);
        //             await subscribeProfiles(doctorUser, listId);

        //             setTimeout(async () => {
        //                 try {
        //                     const deleteProfileResponse = await deleteProfile(doctorUser);
        //                 } catch (error) {
        //                     console.error('Error deleting profile:', error);
        //                 }
        //             }, 60000);

        //             await delay(1000);
        //         } catch (error) {
        //             console.error('Error processing doctor:', email, error);
        //         }
        //     } catch (error) {
        //         console.error(`Failed to send email to ${doctor.email}:`, error);
        //     }
        // }
        // //24 hrs mail sent
        // for (let doctor of twentyFourHoursDoctors) {
        //     try {
        //         const confirmationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/doctor-confirmation?token=${doctor.login_token}`;
        //         const doctorUser = { email: doctor.email, firstName: doctor.firstName, lastName: doctor.lastName };
        //         const listId = 'VBkjZV';
        //         const customProperties = {
        //             firstName: doctor.firstName,
        //             lastName: doctor.lastName,
        //             login_link: confirmationLink
        //         };

        //         try {
        //             setTimeout(async () => {
        //                 try {
        //                     const deleteProfileResponse = await deleteProfile(doctorUser);
        //                 } catch (error) {
        //                     console.error('Error deleting profile:', error);
        //                 }
        //             }, 60000);

        //             await createProfile(doctorUser, customProperties);
        //             await subscribeProfiles(doctorUser, listId);
        //             setTimeout(async () => {
        //                 try {
        //                     const deleteProfileResponse = await deleteProfile(doctorUser);
        //                 } catch (error) {
        //                     console.error('Error deleting profile:', error);
        //                 }
        //             }, 60000);

        //             await delay(1000);
        //         } catch (error) {
        //             console.error('Error processing doctor:', email, error);
        //         }
        //     } catch (error) {
        //         console.error(`Failed to send email to ${doctor.email}:`, error);
        //     }
        // }


        return new Response(
            JSON.stringify({
                message: "Emails sent successfully",
                eightHoursDoctors: eightHoursDoctors,
                twentyFourHoursDoctors:twentyFourHoursDoctors,
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
