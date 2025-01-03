import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';

import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';


export async function GET(req) {
    await connectDB();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const twoDaysAgo = new Date(startOfToday.getTime() - 48 * 60 * 60 * 1000);
    try {
        const pendingDoctors = await Doctor.find({
            password: { $exists: false }, // Doctors without a password

        });
        const pendingDoctorsCount = await Doctor.countDocuments({
            password: { $exists: false }, // Doctors without a password
        });

        if (!pendingDoctors.length) {
            return new Response(
                JSON.stringify({ success: true, message: 'No pending doctors found.' }),
                { status: 200 }
            );
        }


        await Promise.all(pendingDoctors.map(async (doctor, index) => {
            const { firstName, lastName, email, resetToken } = doctor;

            console.log(firstName, lastName, email, resetToken);
            const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/create-password?token=${resetToken}`;


            const user = { email, firstName, lastName };
            const customProperties = {
                user_name: `${firstName} ${lastName}`,
                last_name: lastName,
                generate_password: resetLink,                               
            }

            const listId = 'UckSDK';
            setTimeout(async () => {
                try {
                  await deleteProfile(user);
                } catch (error) {
                  console.error('Error deleting profile:', error);
                }
              }, 60000);
            const createProfilePromise = createProfile(user, customProperties);
            const subscribeProfilePromise = subscribeProfiles(user, listId);
            setTimeout(async () => {
                try {
                  const deleteProfileResponse = await deleteProfile(user);
                } catch (error) {
                  console.error('Error deleting profile:', error);
                }
            }, 60000);
            
             const [createResponse, subscribeResponse] = await Promise.all([
                createProfilePromise,
                subscribeProfilePromise,
              ]);
        }));

        return new Response(JSON.stringify({ success: true, message: 'Pending plans processed successfully.' }), {
            status: 200
        });
    } catch (error) {
        console.error("Error processing pending plans:", error);
        return new Response(JSON.stringify({ success: false, message: error.message }), {
            status: 500
        });
    }
}

