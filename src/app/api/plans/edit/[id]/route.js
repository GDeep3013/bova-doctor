import connectDB from '../../../../../db/db';
import Patient from '../../../../../models/patient';
import Plan from '../../../../../models/plan'

import NextCrypto from 'next-crypto';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

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
  const { items, status='pending', patient_id, message } = await req.json();
  try {
     const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      { items, status, patient_id, message, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedPlan) {
      return new Response(JSON.stringify({ success: false, message: 'Plan not found' }), { status: 404 });
    }

    // Encrypt the ID for the updated plan
    const encryptedId = await crypto.encrypt(updatedPlan._id.toString());
    const urlSafeEncryptedId = encryptedId.replace(/\//g, '-').replace(/=/g, '_');
    const link = `https://bovalabs.com/pages/view-plans?id=${urlSafeEncryptedId}`;

    // Configure email details for the updated plan

    const filePath = path.join(process.cwd(), 'src/app/templates/medicationPlan.html');
    let templateContent = fs.readFileSync(filePath, 'utf8');

    let planType = "Updated Medication Plan"
    templateContent = templateContent.replace('{{planType}}', planType);
    templateContent = templateContent.replace('{{viewPlanLink}}', link);
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
      html: templateContent, 
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
