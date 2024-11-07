// pages/api/doctors/create.js

import crypto from 'crypto';
import {sendEmail} from '../../../lib/sendEmail';
import connectDB from '../../../db/db';
import Doctor from '../../../models/Doctor';
export default async function handler(req, res) {
  connectDB(); 
  if (req.method === 'POST') {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        userType,
        specialty,
      } = req.body;

    
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
        return res.status(400).json({ error: errors });
      }

   
      // Generate reset token and expiry
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Create new doctor in the database
      const newDoctor =  await Doctor.create({       
          firstName,
          lastName,
          email,
          phone,
          userType,
          specialty,        
          resetToken,
          resetTokenExpiry,
        
      });
   

      // Send email with reset token
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
      await sendEmail(email, 'Password Reset Request', resetLink, firstName, lastName);

      const { password: _, ...doctorData } = newDoctor; // Exclude password from the response
      return res.status(201).json({ message: 'Doctor created and reset email sent', doctorData });
    } catch (error) {
      
      return res.status(500).json({ error: error});
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
