import bcrypt from 'bcrypt';
import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';

connectDB();

export async function GET(req) {
  try {
    // Extract the token from the query parameters
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), { status: 400 });
    }

    // Find doctor by the provided token
    const currentDoctor = await Doctor.findOne({ login_token: token });

    if (!currentDoctor) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 404 });
    }

    // Generate a random dummy password
    const generateRandomPassword = (length = 12) => {
      const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
      return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    };

    const dummyPassword = generateRandomPassword();

    // Hash the generated dummy password
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);

    // Update the doctor's record with the dummy password
    currentDoctor.password = hashedPassword;
    currentDoctor.login_token = null; // Remove the token after it's used
    await currentDoctor.save();

    // Send response with email and dummy password (caution with sensitive data in production)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Doctor confirmed successfully',
        email: currentDoctor.email, // Return the email
        password: dummyPassword,   // Return the dummy password (for temporary use only)
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
