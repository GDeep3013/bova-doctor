import connectDB from '../../../../../db/db';
import Doctor from '../../../../../models/Doctor';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../../klaviyo/klaviyo';
connectDB();
export async function PUT(req, { params }) {
    const { id } = params;

    try {
        console.log(id)
        const currentDoctor = await Doctor.findById(id);

        if (!currentDoctor) {
            return new Response(JSON.stringify({ error: 'Doctor not found' }), { status: 404 });
        }

        if (currentDoctor) {
            try {
                const login_link = `${process.env.NEXT_PUBLIC_BASE_URL}/create-password?token=${currentDoctor.resetToken}`;
                const user = {
                    email: currentDoctor.email,
                    firstName: currentDoctor.firstName,
                    lastName: currentDoctor.firstName
                };
                const customProperties = {
                    firstName: currentDoctor.firstName,
                    lastName: currentDoctor.firstName,
                    address: currentDoctor.address,
                    state: currentDoctor.state,
                    city: currentDoctor.city,
                    zipCode: currentDoctor.zipCode,
                    login_link: login_link
                };
                const listId = 'WkSxEa';
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
            } catch (error) {
                console.error('Error handling Klaviyo actions:', error);
            }

        }
        return new Response(JSON.stringify({ status: true, currentDoctor }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message, message: 'Error updating doctor' }), { status: 500 });
    }
}

