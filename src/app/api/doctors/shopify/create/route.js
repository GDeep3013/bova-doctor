
import connectDB from '../../../../../db/db';
import Doctor from '../../../../../models/Doctor';
import InviteToken from '../../../../../models/inviteToken';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../../klaviyo/klaviyo';
import bcrypt from 'bcrypt';
connectDB();
export async function OPTIONS(req) {
    return new Response(null, {
        status: 204,  // No Content
        headers: {
            'Access-Control-Allow-Origin': '*',  // Replace with specific origin if needed
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',  // Adjust as needed
            'Access-Control-Allow-Credentials': 'true',  // Set this based on your needs
        },
    });
}



export async function POST(req) {
    const APP_HEADERS = {
        'Access-Control-Allow-Origin': '*',  
        'Access-Control-Allow-Methods': 'GET, DELETE, PATCH, POST, PUT',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
    };
    try {
        const { firstName, lastName, email, phone, address, state, city, zipCode, inviteToken } = await req.json();

        // const errors = {};
        // if (!firstName || firstName.trim() === '') errors.firstName = 'First name is required';
        // if (!lastName || lastName.trim() === '') errors.lastName = 'Last name is required';
        // if (!email || email.trim() === '') errors.email = 'Email is required';
        // if (!phone || phone.trim() === '') {
        //     errors.phone = 'Phone number is required';
        // } else if (!/^\d{10}$/.test(phone)) {
        //     errors.phone = 'Phone number must be exactly 10 digits';
        // }
        // if (!address || address.trim() === '') errors.address = 'Address is required';
        // if (!state || state.trim() === '') errors.state = 'State is required';
        // if (!city || city.trim() === '') errors.city = 'City is required';
        // if (!zipCode || zipCode.trim() === '') errors.zipCode = 'Zip code is required';
        // if (Object.keys(errors).length > 0) {
        //     return new Response(JSON.stringify({ success: false, error: errors }), { status: 200, headers: APP_HEADERS, });
        // }
       
        // const tokenExists = await InviteToken.findOne({ token: inviteToken });
        // if (!tokenExists) {
      
        //     return new Response(JSON.stringify({ success: false, error: 'Invitation is invalid or expired ' }), { status: 200, headers: APP_HEADERS });
        // }


        const query = {
            $or: [
                { email },
                ...(phone ? [{ phone }] : [])
            ]
        };
        const existingDoctor = await Doctor.findOne(query);
        if (existingDoctor) {
            const errors = []
            if (existingDoctor.email === email) errors.push('Email already exists');
            if (phone && existingDoctor.phone === phone) errors.push('Phone number already exists');
            return new Response(JSON.stringify({ success: false, error: errors }), { status: 200, headers: APP_HEADERS });
        }
        const token = await bcrypt.hash(email + Date.now(), 10);

        await Doctor.create({
            firstName,
            lastName,
            email,
            phone,
            userType: "Doctor",
            address,
            state,
            city,
            zipCode,
            login_token: token,
            // inviteToken: tokenExists.token,
        });

        // await InviteToken.deleteOne({ token: inviteToken });

        try {
            const user = { email: process.env.ADMIN_EMAIL, firstName: process.env.ADMIN_FIRST_NAME, lastName: process.env.ADMIN_LAST_NAME };

            const customProperties = {
                firstName: firstName,
                lastName: lastName,
                doctor_email: email,
                phone: phone,
                address: address,
                state: state,
                city: city,
                zipCode: zipCode
            };

            const listId = 'YxYgt4';

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

        try {

            const confirmationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/doctor-confirmation?token=${token}`;
            const doctorUser = { email: email, firstName: firstName, lastName: lastName };
            const customProperties = {
                firstName: firstName,
                lastName: lastName,
                address: address,
                state: state,
                city: city,
                zipCode: zipCode,
                login_link: confirmationLink
            };

            const DocterlistId = 'WkSxEa';


            setTimeout(async () => {
                try {
                    await deleteProfile(doctorUser);
                } catch (error) {
                    console.error('Error deleting profile:', error);
                }
            }, 60000);
            const createProfilePromise = createProfile(doctorUser, customProperties);
            const subscribeProfilePromise = subscribeProfiles(doctorUser, DocterlistId);

            setTimeout(async () => {
                try {
                    const deleteProfileResponse = await deleteProfile(doctorUser);
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

        return new Response(
            JSON.stringify({
                success: true, message: 'Doctor created  successfully',
            }),
            { status: 201, headers: APP_HEADERS, }
        );
    } catch (error) {
        console.error('Error in POST request:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 200, headers: APP_HEADERS, });
    }
}
