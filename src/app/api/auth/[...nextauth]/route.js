import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';

// Ensure database connection
connectDB();

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate the credentials
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password');
        }

        // Look up the user in the database
        const user = await Doctor.findOne({ email: credentials.email });
        if (!user  ) {
          throw new Error('No user found with this email');
        }

        // Verify the password
        if (!user.password) {
          throw new Error('User has not set a password yet');
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        // Return user object upon successful authentication
        return { id: user._id, email: user.email, userType: user.userType, userName: user.firstName + ' ' + user.lastName ,userDetail: user};
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to custom error page on failure
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // Session duration: 1 day
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userType = user.userType;
        token.userName = user.userName;
        token.userDetail =user.userDetail
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.userType = token.userType;
        session.user.userName = token.userName;
        session.userDetail =token.userDetail

      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
