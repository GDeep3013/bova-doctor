
import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import bcrypt from 'bcryptjs';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';
connectDB();

export async function PUT(req, { params }) {

    const { id, password } = await req.json();
    try {
        const currentDoctor = await Doctor.findById(id);
        if (!currentDoctor) {
            return new Response(JSON.stringify({ error: 'Doctor not found' }), { status: 404 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        currentDoctor.password = hashedPassword;

        try {
            const userData = {
                email: currentDoctor.email,
                firstName: currentDoctor.firstName,
                lastName: currentDoctor.lastName
            };
            const customProperties = { firstName: currentDoctor.firstName, lastName: currentDoctor.lastName, };
            const listId = 'SwGDpn';
            
            try {
                setTimeout(async () => {
                    try {
                        const deleteProfileResponse = await deleteProfile(userData);
                    } catch (error) {
                        console.error('Error deleting profile:', error);
                    }
                }, 60000);

                await createProfile(userData, customProperties);
                await subscribeProfiles(userData, listId);

                setTimeout(async () => {
                    try {
                        const deleteProfileResponse = await deleteProfile(userData);
                    } catch (error) {
                        console.error('Error deleting profile:', error);
                    }
                }, 60000);

                await delay(1000);
            } catch (error) {
                console.error('Error processing doctor:', currentDoctor.email, error);
            }
        } catch (error) {
            console.error(`Failed to send email to ${currentDoctor.email}:`, error);
        }

        await currentDoctor.save();

        return new Response(JSON.stringify({ status: true, message: 'Password updated successfully' }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message, message: 'Error updating password' }), { status: 500 });
    }
}