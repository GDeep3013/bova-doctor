import crypto from 'crypto';

import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';

connectDB(); // Ensure database connection is established

export async function POST(req) {
  try {

    // Parse formData from the request body
    const formData = await req.formData();
    // Extract fields from formData
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    let phone = formData.get('phone');
    phone = phone ? phone.trim() : '';
    const userType = formData.get('userType');
    const clinicName = formData.get('clinicName');
    const specialty = formData.get('specialty');
    const commissionPercentage = formData.get('commissionPercentage');
    const address = formData.get('address');
    const state = formData.get('state');
    const city = formData.get('city');
    const zipCode = formData.get('zipCode');

    // console.log(phone, 'phone')
    // Check if the doctor already exists with the same email or phone

    const query = {
      $or: [
        { email },
        ...(phone ? [{ phone }] : [])
      ]
    };

    const existingDoctor = await Doctor.findOne(query);
    if (existingDoctor) {
      const errors = [];
      
      if (existingDoctor.email === email) {
        errors.push('Email already exists');
      }

      if (phone && existingDoctor.phone === phone) {
        errors.push('Phone number already exists');
      }
      return new Response(JSON.stringify({ error: errors }), { status: 400 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const newDoctor = await Doctor.create({
      firstName,
      lastName,
      email,
      phone,
      clinicName,
      userType,
      specialty,
      commissionPercentage,
      resetToken,
      address,
      city,
      state,
      zipCode,
      reminderDate: new Date()
    });

    const mailtype = 'Set Up Password';
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/create-password?token=${resetToken}`;

    try {
      const user = { email, firstName, lastName };
      const customProperties = {
        user_name: `${firstName} ${lastName}`,
        generate_password: resetLink,
        btn_type: mailtype,
      };
      const listId = 'X4rheV';

      setTimeout(async () => {
        try {
          const deleteProfileResponse = await deleteProfile(user);
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

    const { password: _, ...doctorData } = newDoctor._doc;

    return new Response(
      JSON.stringify({
        message: 'Doctor created and reset email sent successfully',
        doctorData,
      }),
      { status: 201 });
  } catch (error) {
    console.error('Error in POST request:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
