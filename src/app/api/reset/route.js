import connectDB from '../../../db/db';
import Doctor from '../../../models/Doctor';
import bcrypt from 'bcryptjs';

connectDB();
export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();
    const user = await Doctor.findOne({
      resetToken: token,     
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 400 });
    }

    const isPasswordAlreadySet = !!user.password;   
    const hashedPassword = await bcrypt.hash(newPassword, 10);        

    await Doctor.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        resetToken: null,
        ...(isPasswordAlreadySet
          ? {} 
          : { passwordCreatedDate: new Date() }), 
      }
    );

    return new Response(JSON.stringify({ message: 'Password reset successful' }), { status: 200 });
    
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to reset password', message: error.message }), { status: 500 });
  }
}
