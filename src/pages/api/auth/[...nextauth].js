// pages/api/auth/[...nextauth].js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '../../../db/db';
import Doctor from '../../../models/Doctor';

connectDB(); 

const prisma = new PrismaClient();
export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await Doctor.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return { id: user.id, email: user.email };
      },
    }),
  ],
  pages: {
<<<<<<< HEAD
    signIn: '/login',    // Redirect here if sign-in is required
    error: '/login',     // Redirect here on error
=======
    signIn: '/login',
    error:'/login'
>>>>>>> 9ca45f42a37d10808d53aaff8bf0a34fed527d20
  },
  session: {
    strategy: 'jwt', // Use JSON Web Tokens for session
    maxAge: 24 * 60 * 60, // Set session to last 1 day (24 hours)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
