// pages/api/auth.js
import bcrypt from 'bcrypt';
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // return res.status(401).json({ message: user });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set up session or token here
    return res.status(200).json({ message: 'Login successful', user });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
