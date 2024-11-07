// src/app/api/doctors/request-password-reset/route.js
import crypto from 'crypto'; // To generate a random token
import { sendEmail } from '../../../lib/sendEmail'; // Adjust the path as needed
import connectDB from '../../../db/db';
import Doctor from '../../../models/Doctor';

connectDB(); // Ensure database connection is established

export async function POST(req) {
  try {
    const { email } = await req.json();
    const user = await Doctor.findOne({ email });
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Email not found' }), { status: 404 });
    }

    // Generate reset token and set expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Token expires in 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

      const { firstName, lastName } = user;
      const mailtype='Reset your password'
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    // Send password reset email
    await sendEmail(email, 'Password Reset Request', resetLink, firstName, lastName,mailtype);

    return new Response(JSON.stringify({ message: 'Password reset email sent' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to send reset email' }), { status: 500 });
  }
}
