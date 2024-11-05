import crypto from 'crypto'; // To generate a random token
import { sendEmail } from '../../lib/sendEmail'; // Assume a sendEmail function is set up
import Doctor from '../../models/Doctor'; // Adjust path as needed for your project

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email } = req.body;
      const user = await Doctor.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'Email not found' });
      }
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000);
      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();

      const firstName = user.firstName;
      const lastName = user.lastName;
        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
        
      await sendEmail(email, 'Password Reset Request', resetLink, firstName, lastName);

      return res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to send reset email' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}