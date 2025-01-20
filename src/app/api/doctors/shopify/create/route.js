
import connectDB from '../../../../../db/db';
import Doctor from '../../../../../models/Doctor';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../../klaviyo/klaviyo';

connectDB(); // Ensure database connection is established

const APP_HEADERS = {
    'Access-Control-Allow-Origin': '*',  // replace with your actual origin if needed
    'Access-Control-Allow-Methods': 'GET, DELETE, PATCH, POST, PUT',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
};
// import { sendEmail } from '@/utils/email';

export async function POST(req) {
    try {

        const { firstName, lastName, email, phone, address, state, city, zipCode } = await req.json();

        const errors = {};

        if (!firstName || firstName.trim() === '') errors.firstName = 'First name is required';
        if (!lastName || lastName.trim() === '') errors.lastName = 'Last name is required';
        if (!email || email.trim() === '') errors.email = 'Email is required';
        if (!phone || phone.trim() === '') {
            errors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(phone)) {
            errors.phone = 'Phone number must be exactly 10 digits';
        }
        if (!address || address.trim() === '') errors.address = 'Address is required';
        if (!state || state.trim() === '') errors.state = 'State is required';
        if (!city || city.trim() === '') errors.city = 'City is required';
        if (!zipCode || zipCode.trim() === '') errors.zipCode = 'Zip code is required';

        if (Object.keys(errors).length > 0) {
            return new Response(JSON.stringify({ error: errors }), { status: 400, headers: APP_HEADERS });
        }

        const query = {
            $or: [
                { email },
                ...(phone ? [{ phone }] : []) 
            ]
        };
        const existingDoctor = await Doctor.findOne(query);
        if (existingDoctor) {
            if (existingDoctor.email === email) {
                errors.email = 'Email already exists';
            }
            if (phone && existingDoctor.phone === phone) {
                errors.phone = 'Phone number already exists';
            }
        }
        
        // If errors exist, return a keyed response
        if (Object.keys(errors).length > 0) {
            return new Response(JSON.stringify({ error: errors }), { status: 400, headers: APP_HEADERS });
        }
        await Doctor.create({
            firstName,
            lastName,
            email,
            phone,
            userType: "Doctor",
            address,
            state,
            city,
            zipCode
        });

        
        // try {
        //     const user = {
        //         email: "sahil.610weblab@gmail.com",
        //         firstName:"sahil",
        //         lastName:"Dharmani"
        //     };
        //     const customProperties = {
        //         firstName:firstName,
        //         lastName:lastName,
        //         doctor_email:email,
        //         phone:phone,              
        //         address:address,
        //         state:state,
        //         city:city,
        //         zipCode:zipCode              
        //     };
        //     console.log(user,customProperties)

        //     const listId = 'YxYgt4';

        //     setTimeout(async () => {
        //         try {
        //             await deleteProfile(user);
        //         } catch (error) {
        //             console.error('Error deleting profile:', error);
        //         }
        //     }, 60000);
        //     const createProfilePromise = createProfile(user, customProperties);
        //     const subscribeProfilePromise = subscribeProfiles(user, listId);

        //     setTimeout(async () => {
        //         try {
        //             const deleteProfileResponse = await deleteProfile(user);
        //         } catch (error) {
        //             console.error('Error deleting profile:', error);
        //         }
        //     }, 60000);

        //     const [createResponse, subscribeResponse] = await Promise.all([
        //         createProfilePromise,
        //         subscribeProfilePromise,
        //     ]);
        // } catch (error) {
        //     console.error('Error handling Klaviyo actions:', error);
        // }


        return new Response(
            JSON.stringify({
                message: 'Doctor created  successfully',
            }),
            { status: 201, headers: APP_HEADERS }
        );
    } catch (error) {
        console.error('Error in POST request:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: APP_HEADERS });
    }
}
