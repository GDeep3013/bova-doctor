// src/app/api/doctors/reset-password/route.js
import connectDB from '../../../db/db';
import Doctor from '../../../models/Doctor';
import bcrypt from 'bcryptjs';

connectDB(); // Ensure the database is connected

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    const user = await Doctor.findOne({
      resetToken: token,
      resetTokenExpiry: { $gte: new Date() }, // Check if the token is still valid
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token fields
    await Doctor.updateOne(
      { _id: user._id }, // Find user by their unique ID
      {
        password: hashedPassword,
        resetToken: null, // Clear the reset token
        resetTokenExpiry: null, // Clear the token expiry
      }
    );

    return new Response(JSON.stringify({ message: 'Password reset successful' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to reset password', message: error.message }), { status: 500 });
  }
}
