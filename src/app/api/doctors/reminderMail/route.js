import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';

import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function GET(req) {

    await connectDB();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const twoDaysAgo = new Date(startOfToday.getTime() - 48 * 60 * 60 * 1000);

    try {
        const pendingDoctors = await Doctor.find({
            password: { $exists: false },
            reminderDate: {
                $gte: twoDaysAgo,
                $lt: startOfToday
            }
        });

        const pendingDoctorsCount = await Doctor.countDocuments({
            password: { $exists: false },
            reminderDate: {
                $gte: twoDaysAgo,
                $lt: startOfToday
            }
        });

        if (!pendingDoctors.length) {
            return new Response(
                JSON.stringify({ success: true, message: 'No pending doctors found.' }),
                { status: 200 }
            );
        }


        // await Promise.all(pendingDoctors.map(async (doctor, index) => {
        //     const { firstName, lastName, email, resetToken } = doctor;

        //     console.log(firstName, lastName, email, resetToken);
        //     const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/create-password?token=${resetToken}`;
        //     const user = { email, firstName, lastName };
        //     const customProperties = {
        //         user_name: `${firstName} ${lastName}`,
        //         last_name: lastName,
        //         generate_password: resetLink,                               
        //     }

        //     const listId = 'UckSDK';

        //    await deleteProfile(user);

        //     const createProfilePromise = createProfile(user, customProperties);
        //     const subscribeProfilePromise = subscribeProfiles(user, listId);
        //     setTimeout(async () => {
        //         try {
        //           const deleteProfileResponse = await deleteProfile(user);
        //         } catch (error) {
        //           console.error('Error deleting profile:', error);
        //         }
        //     }, 60000);

        //      const [createResponse, subscribeResponse] = await Promise.all([
        //         createProfilePromise,
        //         subscribeProfilePromise,
        //       ]);
        // }));

        for (const doctor of pendingDoctors) {
            const { firstName, lastName, email, resetToken } = doctor;
            const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/create-password?token=${resetToken}`;
            const user = { email, firstName, lastName };

            const customProperties = {
                user_name: `${firstName} ${lastName}`,
                last_name: lastName,
                generate_password: resetLink,
            };

            const listId = 'UckSDK';

            try {
                setTimeout(async () => {
                    try {
                        const deleteProfileResponse = await deleteProfile(user);
                    } catch (error) {
                        console.error('Error deleting profile:', error);
                    }
                }, 60000);

                await createProfile(user, customProperties);

                await subscribeProfiles(user, listId);

                setTimeout(async () => {
                    try {
                        const deleteProfileResponse = await deleteProfile(user);
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
        }
        return new Response(JSON.stringify({ success: true, message: `Pending doctor reminder send processed successfully.Total pending doctor ${pendingDoctorsCount}` }), {
            status: 200
        });
    } catch (error) {
        console.error("Error processing pending plans:", error);
        return new Response(JSON.stringify({ success: false, message: error.message }), {
            status: 500
        });
    }
}

