

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


import crypto from 'crypto'; // To generate a random token
import { sendEmail } from '../../lib/sendEmail'; // Assume a sendEmail function is set up

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { email } = await  req.body;
        
            const user = await prisma.doctor.findUnique({ where: { email } });
            if (!user) {
                return res.status(404).json({ error: 'Email not found' });
            }
        
            // Generate a random reset token and expiry time
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 3600000);
        
            await prisma.doctor.update({
                where: { email },
                data: {
                    resetToken,
                    resetTokenExpiry,
                },
            });
        
           
            const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
            await sendEmail(email, 'Password Reset Request', `Reset your password using this link: ${resetLink}`);
        
            return res.status(200).json({ message: 'Password reset email sent' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to send reset email' });
        }
    }
}