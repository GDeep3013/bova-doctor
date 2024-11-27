import connectDB from '../../../../db/db';
import Plan from '../../../../models/plan'
import Patient from '../../../../models/patient';

import NextCrypto from 'next-crypto';
import nodemailer from 'nodemailer';
import { medicationPlan } from '../../../templates/medicationPlan'
import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';

export async function POST(req) {
  await connectDB();
  const crypto = new NextCrypto();

  const { formData: { items, patient_id, message }, status = 'pending', selectedItems, doctor } = await req.json();
  const planData = {
    patient_id: patient_id,
    message,
    status,
    items,
    createdAt: new Date()
  };

  // Save the new plan to the database

  try {
    const plan = await Plan.create(planData);
    // console.log(selectedItems);

    const encryptedId = await crypto.encrypt(plan._id.toString());

    // Make the encrypted ID URL-safe by replacing `/` and `=` characters
    const urlSafeEncryptedId = encryptedId
      .replace(/\//g, '-')  // Replace `/` with `-`
      .replace(/\=/g, '_'); // Replace `=` with `_`

    const link = `https://bovalabs.com/pages/view-plans?id=${urlSafeEncryptedId}`;

    const patient = await Patient.findOne({ _id: patient_id })
    // const customProperties = {
    //   patient_name: `${patient.firstName} ${patient.lastName}`,
    //   doctor_name: doctor.name,
    //   doctor_email: doctor.email,
    //   doctor_clinic_name: doctor.clinicName,
    //   payment_link: link,
    //   product_details: items,
    // };
    
    
  
    
    // return customProperties;
    // console.log(items.properties);

    // console.log(customProperties);
    // return customProperties;
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });

    // Set up the email content
    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: patient.email,
    //   subject: 'Your Medication Plan',
    //   html: medicationPlan(patient, doctor, link, items, selectedItems)  // 
    // };
    // await transporter.sendMail(mailOptions);

    try {
      // const user = { firstName, lastName };
      const customProperties = {
        patient_name: patient.firstName+' '+patient.lastName,
        doctor_name: doctor.name,
        doctor_email:doctor.email,
        doctor_clinic_name:doctor.clinicName,
        payment_link: link,
        product_details: items,
      };
      const listId = 'XY5765';

      const createProfilePromise = createProfile(patient, customProperties);
      const subscribeProfilePromise = subscribeProfiles(patient, listId);

      setTimeout(async () => {
        try {
          const deleteProfileResponse = await deleteProfile(patient);
        } catch (error) {
          console.error('Error deleting profile:', error);
        }
      }, 60000);

      const [createResponse, subscribeResponse] = await Promise.all([
        createProfilePromise,
        subscribeProfilePromise,
      ]);
    }
    catch (error) {
      console.error('Error handling Klaviyo actions:', error);
    }


    return new Response(JSON.stringify({ success: true, data: plan }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
    });
  }
}


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const encryptedId = searchParams.get('id');
  if (!encryptedId) {
    return new Response(JSON.stringify({ success: false, message: 'Plan ID is required' }), {
      status: 400,
    });
  }
  try {
    // Decrypt the plan ID
    const crypto = new NextCrypto();
    const planId = await crypto.decrypt(encryptedId);

    // Retrieve the plan by its decrypted ID
    const plan = await Plan.findById(planId);

    if (!plan) {
      return new Response(JSON.stringify({ success: false, message: 'Plan not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ success: true, data: plan }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
    });
  }
}