

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { token, newPassword } = await req.body;;
        
            const user = await prisma.doctor.findFirst({
              where: {
                resetToken: token,
                resetTokenExpiry: {
                  gte: new Date(), // Check if the token is still valid
                },
              },
            });
        
            if (!user) {
              return res.status(400).json({ error: 'Invalid or expired token' }, { status: 400 });
            }
        
            const hashedPassword = await bcrypt.hash(newPassword, 10);
        
            await prisma.doctor.update({
              where: { id: user.id },
              data: {
                password: hashedPassword,
                resetToken: null, // Clear the reset token
                resetTokenExpiry: null, // Clear the token expiry
              },
            });
        
            return res.status(200).json({ message: 'Password reset successful' });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to reset password', message:error }, { status: 500 });
          }
    }
}

