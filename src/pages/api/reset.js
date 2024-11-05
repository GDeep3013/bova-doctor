

import connectDB from '../../db/db';
import Doctor from '../../models/Doctor';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  connectDB()
    if (req.method === 'POST') {
        try {
            const { token, newPassword } = await req.body;;
        
            const user = await Doctor.findOne({
              resetToken: token,
              resetTokenExpiry: { $gte: new Date() } // Check if the token is still valid
            });
      
            if (!user) {
              return res.status(400).json({ error: 'Invalid or expired token' });
            }
      
            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
      
            // Update the user's password and clear the reset token fields
            await Doctor.updateOne(
              { _id: user._id }, // Find user by their unique ID
              {
                password: hashedPassword,
                resetToken: null, // Clear the reset token
                resetTokenExpiry: null // Clear the token expiry
              }
            );
        
            return res.status(200).json({ message: 'Password reset successful' });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to reset password', message:error }, { status: 500 });
          }
    }
}

