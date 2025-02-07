import connectDB from '../../../db/db';
import Doctor from '../../../models/Doctor';
import bcrypt from 'bcryptjs';
import { createProfile, subscribeProfiles, deleteProfile } from '../../klaviyo/klaviyo';

connectDB();

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();
    const user = await Doctor.findOne({
      resetToken: token,
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 400 });
    }

    const isPasswordAlreadySet = !!user.password;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (!isPasswordAlreadySet) {
      try {
        const userData = { email: user.email, firstName: user.firstName, lastName: user.lastName };
        const customProperties = {
          firstName: user.firstName,
          lastName: user.lastName,
        };

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
          console.error('Error processing doctor:', email, error);
        }
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
      }
    }

    await Doctor.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,        
        ...(isPasswordAlreadySet
          ? {}
          : { passwordCreatedDate: new Date() }),
      }
    );

    return new Response(JSON.stringify({ message: 'Password reset successful', email: user.email, password: newPassword, }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({
      error: 'Failed to reset password',
      message: error.message
    }), { status: 500 });
  }
} 
