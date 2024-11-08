import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { sendEmail } from '../../../../lib/sendEmail';
import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';

connectDB(); // Ensure database connection is established

export async function POST(req) {
  try {
    // Parse formData from the request body
    const formData = await req.formData();

    // Extract fields from formData
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const userType = formData.get('userType');
    const specialty = formData.get('specialty');
    const message = formData.get('message');
    const imageFile = formData.get('profileImage');

    // Check if the doctor already exists with the same email or phone
    const existingDoctor = await Doctor.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingDoctor) {
      const errors = [];
      if (existingDoctor.email === email) {
        errors.push('Email already exists');
      }
      if (existingDoctor.phone === phone) {
        errors.push('Phone number already exists');
      }
      return new Response(JSON.stringify({ error: errors }), { status: 400 });
    }

    // Generate reset token and expiry (for password reset)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    let imageUrl = '';
    if (imageFile) {
      // Convert file to buffer
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      // Ensure the uploads directory exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if it doesn't exist
      }

      // Generate a unique filename for the image
      const uniqueFileName = `${crypto.randomBytes(16).toString('hex')}${path.extname(imageFile.name)}`;
      const uploadPath = path.join(uploadDir, uniqueFileName);

      // Save the image file to the uploads directory
      fs.writeFileSync(uploadPath, buffer);

      // Set the relative URL path to the image
      imageUrl = `/uploads/${uniqueFileName}`;
    }

    // Create a new doctor document in the database
    const newDoctor = await Doctor.create({
      firstName,
      lastName,
      email,
      phone,
      userType,
      message,
      specialty,
      resetToken,
      resetTokenExpiry,
      profileImage: imageUrl, // Image path (if any)
    });

    // Send reset password email to the doctor
    const mailtype = 'Create Password';
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
    await sendEmail(email, 'Password Reset Request', resetLink, firstName, lastName, mailtype);

    // Exclude the password from the response before returning
    const { password: _, ...doctorData } = newDoctor._doc;

    return new Response(JSON.stringify({
      message: 'Doctor created and reset email sent successfully',
      doctorData,
    }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
