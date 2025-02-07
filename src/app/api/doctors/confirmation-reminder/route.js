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
            password: { $exists: false },
            login_token: { $exists: true }
        });

        const twentyFourHoursDoctors = [];
        const eightHoursDoctors = [];
        
        const calculateHoursDifference = (createdDate) => {
            const now = dayjs();
            const created = dayjs(createdDate);
            const diffInHours = now.diff(created, 'hour');
            return diffInHours;
        };

        doctors.forEach((doctor) => {
            const timeCalculate = calculateHoursDifference(doctor.createdAt);
            if (timeCalculate >= 8 && timeCalculate < 9) {
                eightHoursDoctors.push(doctor);
            } else if (timeCalculate >= 24 && timeCalculate < 25) {
                twentyFourHoursDoctors.push(doctor);
            }
        });

    // 8hrs mail sent        
        for (let doctor of eightHoursDoctors) {
            try {
                const confirmationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/doctor-confirmation?token=${doctor.login_token}`;
                const doctorUser = {
                    email: doctor.email,
                    firstName: doctor.firstName,
                    lastName: doctor.lastName
                };
                const listId = 'VRe747';

                const customProperties = {
                    firstName: doctor.firstName,
                    lastName: doctor.lastName,
                    login_link: confirmationLink
                };

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

            //         setTimeout(async () => {
            //             try {
            //                 const deleteProfileResponse = await deleteProfile(doctorUser);
            //             } catch (error) {
            //                 console.error('Error deleting profile:', error);
            //             }
            //         }, 60000);

                    await delay(1000);
                } catch (error) {
                    console.error('Error processing doctor:', email, error);
                }
            } catch (error) {
                console.error(`Failed to send email to ${doctor.email}:`, error);
            }}

        //24 hrs mail sent
        for (let doctor of twentyFourHoursDoctors) {
            try {

                const confirmationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/doctor-confirmation?token=${doctor.login_token}`;
                const doctorUser = { email: doctor.email, firstName: doctor.firstName, lastName: doctor.lastName };
                const listId = 'VBkjZV';

                const customProperties = {
                    firstName: doctor.firstName,
                    lastName: doctor.lastName,
                    login_link: confirmationLink
                };

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
                } catch (error) {
                    console.error('Error processing doctor:', email, error);
                }
            } catch (error) {
                console.error(`Failed to send email to ${doctor.email}:`, error);
            }
        }

        return new Response(
            JSON.stringify({
                message: "Emails sent successfully",
                eightHoursDoctors: eightHoursDoctors,
                twentyFourHoursDoctors: twentyFourHoursDoctors,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    }catch (error) {
        console.error("Error processing request:", error);
        return new Response(
            JSON.stringify({ message: "An error occurred", error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
