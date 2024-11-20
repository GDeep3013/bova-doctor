import connectDB from '../../../../../db/db';
import Patient from '../../../../../models/patient';
import Plan from '../../../../../models/plan'

import NextCrypto from 'next-crypto';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import {medicationPlan} from '../../../../templates/medicationPlan'

export async function GET(req, { params }) {
  const { id } = params; 
  await connectDB();

  try {
    const plan = await Plan.findById(id).populate('patient_id');
    if (!plan) {
      return new Response(JSON.stringify({ message: 'Plan not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(plan), {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return new Response(
      JSON.stringify({ message: 'Error fetching plan and patient details' }),
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  await connectDB();
  const crypto = new NextCrypto();
  const { id } = params; 
  const { formData: { items, patient_id, message } ,status = 'pending',selectedItems ,doctor} = await req.json();
  try {
     const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      { items, status, patient_id, message, updatedAt: new Date() },
      { new: true }
    ).populate('patient_id');

    if (!updatedPlan) {
      return new Response(JSON.stringify({ success: false, message: 'Plan not found' }), { status: 404 });
    }

   
    const encryptedId = await crypto.encrypt(updatedPlan._id.toString());

    // Make the encrypted ID URL-safe by replacing `/` and `=` characters
    const urlSafeEncryptedId = encryptedId
      .replace(/\//g, '-')  // Replace `/` with `-`
      .replace(/\=/g, '_'); // Replace `=` with `_`

    const link = ` https://bovalabs.com//pages/view-plans?id=${urlSafeEncryptedId}`;
  
     const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const patient = await Patient.findById(patient_id);

    if (!patient) {
      return new Response(JSON.stringify({ success: false, message: 'Patient not found' }), { status: 404 });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patient.email,
      subject: 'Your Updated Medication Plan',
      html: medicationPlan(patient,doctor,link,items,selectedItems), 
    };

    // Send the update notification email
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true, data: updatedPlan }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}


export async function DELETE(req, { params }) {
  const { id } = params; // Get 'id' from the URL

  // Connect to the database
  await connectDB();

  try {
    await Plan.findByIdAndDelete(id);
    return new Response(null, { status: 204 }); // No content
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
