import bcrypt from 'bcrypt';
import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';

connectDB();

export async function GET(req) {
  try {

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), { status: 400 });
    }

    const currentDoctor = await Doctor.findOne({ login_token: token });

    if (!currentDoctor) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 404 });
    }

    const generateRandomPassword = (length = 12) => {
      const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
      return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    };

    const dummyPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);
    currentDoctor.password = hashedPassword;
    currentDoctor.passwordCreatedDate = new Date()
    // currentDoctor.login_token = null;
    await currentDoctor.save();
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Doctor confirmed successfully',
        email: currentDoctor.email,
        password: dummyPassword,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message, message: 'Error confirming doctor' }),
      { status: 500 }
    );
  }
}
