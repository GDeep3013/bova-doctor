// src/app/api/doctors/create/route.js
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '../../../../lib/sendEmail';
import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';

connectDB(); // Ensure database connection is established

export async function POST(req) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      userType,
      specialty,
    } = await req.json();

    // Check if doctor already exists with the same email or phone
    const existingDoctor = await Doctor.findOne({ 
      $or: [{ email }, { phone }] 
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

    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Create new doctor in the database
    const newDoctor = await Doctor.create({       
      firstName,
      lastName,
      email,
      phone,
      userType,
      specialty,        
      resetToken,
      resetTokenExpiry,
    });

      const mailtype = 'Create Password'
    
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
    await sendEmail(email, 'Password Reset Request', resetLink, firstName, lastName, mailtype);

    const { password: _, ...doctorData } = newDoctor._doc; // Exclude password from the response
    return new Response(JSON.stringify({ message: 'Doctor created and reset email sent', doctorData }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
