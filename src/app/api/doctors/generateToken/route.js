
import connectDB from '../../../../db/db';
import InviteToken from '../../../../models/inviteToken';
import { randomBytes } from 'crypto';
connectDB();
export async function POST(req) {
    try {
      // Generate a unique token
      const token = randomBytes(16).toString('hex');
  
      // Save token in the database
      const newToken = new InviteToken({ token });
      await newToken.save();
  
      // Return the token in the response
      return new Response(JSON.stringify({ success: true, token }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error generating token:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }