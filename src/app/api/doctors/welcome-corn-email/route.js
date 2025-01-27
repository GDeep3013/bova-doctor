import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import { createProfile, subscribeProfiles } from '../../../klaviyo/klaviyo';

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET(req) {
    try {
        await connectDB();

        const doctors = await Doctor.find({
            password: { $exists: true }, // Doctors who have set their password
        });

        const now = new Date();
        const targetDoctors = doctors.filter((doctor) => {
            const createdAt = new Date(doctor.createdAt);
            const diffInMs = now - createdAt;
            const diffInHours = diffInMs / (1000 * 60 * 60); // Convert to hours
            return diffInHours >= 24 && diffInHours < 25; // Matches the 24-hour window
        });

        // for (const doctor of targetDoctors) {
        //     try {
        //         // Prepare email content
        //         const confirmationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/doctor-confirmation?token=${doctor.login_token}`;
        //         const doctorUser = {
        //             email: doctor.email,
        //             firstName: doctor.firstName,
        //             lastName: doctor.lastName,
        //         };
        //         const listId = 'VBkjZV'; // Example list ID for Klaviyo
        //         const customProperties = {
        //             firstName: doctor.firstName,
        //             lastName: doctor.lastName,
        //             login_link: confirmationLink,
        //         };

        //         // Send the email via Klaviyo or other service
        //         await createProfile(doctorUser, customProperties);
        //         await subscribeProfiles(doctorUser, listId);

        //         console.log(`Email sent to ${doctor.email}`);
        //         await delay(1000); // Add a delay to avoid rate-limiting issues
        //     } catch (error) {
        //         console.error(`Error sending email to ${doctor.email}:`, error);
        //     }
        // }

        return new Response(
            JSON.stringify({
                message: 'Emails sent successfully',
                processedDoctors: targetDoctors,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error processing request:', error);
        return new Response(
            JSON.stringify({ message: 'An error occurred', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
   
    }
}
