import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';


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

        const currentTime = new Date();
        const eightHoursDoctors = [];
        const twentyFourHoursDoctors = [];

        doctors.forEach((doctor) => {
            const createdDate = new Date(doctor.createdAt);
            const timeDifference = (currentTime - createdDate) / (1000 * 60 * 60);

            if (timeDifference >= 7.9 && timeDifference < 8) {
                eightHoursDoctors.push(doctor);
                console.log(timeDifference, 'timeDifference')
            } else if (timeDifference >= 23.9 && timeDifference < 24) {
                twentyFourHoursDoctors.push(doctor);
                console.log(timeDifference, 'timeDifference')

            }
            console.log(createdDate, doctor?.email)
            console.log(timeDifference, doctor?.email);
        });

        for (let doctor of eightHoursDoctors) {
            try {
                const doctorUser = { email: doctor.email, firstName: doctor.firstName, lastName: doctor.lastName };
                const listId = 'UckSDK';
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
                    doctor.reminderDate = now;
                    await doctor.save();

                    await delay(1000);
                } catch (error) {
                    console.error('Error processing doctor:', email, error);
                }
            } catch (error) {
                console.error(`Failed to send email to ${doctor.email}:`, error);
            }
        }

        for (let doctor of twentyFourHoursDoctors) {
            try {
                const doctorUser = { email: doctor.email, firstName: doctor.firstName, lastName: doctor.lastName };

                const listId = 'UckSDK';
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
                eightHoursDoctors: eightHoursDoctors.map((doc) => doc.email),
                twentyFourHoursDoctors: twentyFourHoursDoctors.map((doc) => doc.email)
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
