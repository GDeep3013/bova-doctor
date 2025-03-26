
import connectDB from '../../../../../db/db';
import Doctor from '../../../../../models/Doctor';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../../klaviyo/klaviyo';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { logger } from "../../../../../../logger";
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
        const resetToken = crypto.randomBytes(32).toString('hex');
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
            resetToken,
            login_token: token,
            commissionPercentage: '35'
            // inviteToken: tokenExists.token,
        });

        // await InviteToken.deleteOne({ token: inviteToken });
        logger.info(`shopify Doctor   Email= ${email} ,name = ${firstName} ${lastName} ,phone =${phone},Address= ${address} , state = ${state} city=${city} ,zipCode=${zipCode}`);
        try {
            const user = { email: process.env.ADMIN_EMAIL, firstName: process.env.ADMIN_FIRST_NAME, lastName: process.env.ADMIN_LAST_NAME };
            const doctorUser = { email: email, firstName: firstName, lastName: lastName };

            const customProperties = {
                firstName: firstName,
                lastName: lastName,
                doctor_email: email,
                phone: phone,
                address: address,
                state: state,
                city: city,
                zipCode: zipCode,
            };

            const listId = 'YxYgt4';
            if (firstName && lastName && email) {

                await deleteProfile(user);
                await deleteProfile(doctorUser);

                const createProfilePromise = createProfile(user, customProperties);
                const subscribeProfilePromise = subscribeProfiles(user, listId);
                const [createResponse, subscribeResponse] = await Promise.all([
                    createProfilePromise,
                    subscribeProfilePromise,
                ]);

                logger.info(`Shippment Request Email send to Admin = ${user.email} for the doctor = ${doctorUser.email}  `);

                setTimeout(async () => {
                    try {
                        await deleteProfile(user);
                    } catch (error) {
                        console.error('Error deleting profile:', error);
                    }
                }, 60000);
            }
        } catch (error) {
            logger.log({
                level: 'error',
                message: `Error handling Klaviyo actions: ${error.message}`,
                details: error.response?.data || error.stack || error.toString()
            });
            console.error('Error handling Klaviyo actions:', error);
        }

        try {
            const confirmationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/doctor-confirmation?token=${token}`;
            const doctorUser = { email: email, firstName: firstName, lastName: lastName };
            const DocterlistId = 'WkSxEa';
            const customProperties = {
                firstName: firstName,
                lastName: lastName,
                address: address,
                state: state,
                city: city,
                zipCode: zipCode,
                login_link: confirmationLink
            };

            const createProfilePromise = createProfile(doctorUser, customProperties);
            const subscribeProfilePromise = subscribeProfiles(doctorUser, DocterlistId);

            const [createResponse, subscribeResponse] = await Promise.all([
                createProfilePromise,
                subscribeProfilePromise,
            ]);

            logger.info(`Login Email send to shopify Doctor = ${doctorUser.email}  `);

            setTimeout(async () => {
                try {
                    await deleteProfile(doctorUser);
                } catch (error) {
                    console.error('Error deleting profile:', error);
                }
            }, 60000);

        } catch (error) {
            logger.log({
                level: 'error',
                message: `Error handling Klaviyo actions: ${error.message}`,
                details: error.response?.data || error.stack || error.toString()
            });
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