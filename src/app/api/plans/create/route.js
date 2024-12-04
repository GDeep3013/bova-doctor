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
    // console.log(selectedItems, items);
    const mergeArrays = (selectedItems, items) => {
      const mailData = selectedItems.map(selectedItem => {
        const matchingItem = items.find(item => item.id === selectedItem.id);
        const plainDescription = selectedItem.product.descriptionHtml.replace(/<[^>]*>/g, '').trim();

        return {
          title: selectedItem.product.title,
          description: plainDescription,
          image: selectedItem.product.images?.[0].url || null, // Use first image if available
          properties: matchingItem?.properties || {}, // Add properties from items if matched
        };
      });
    
      return mailData;
    };
    const mailData = mergeArrays(selectedItems, items);    
    
    const plan = await Plan.create(planData);

    const encryptedId = await crypto.encrypt(plan._id.toString());

    // Make the encrypted ID URL-safe by replacing `/` and `=` characters
    const urlSafeEncryptedId = encryptedId
      .replace(/\//g, '-')  // Replace `/` with `-`
      .replace(/\=/g, '_'); // Replace `=` with `_`

    const link = `https://bovalabs.com/pages/view-plans?id=${urlSafeEncryptedId}`;

    const patient = await Patient.findOne({ _id: patient_id })
    try {
      const customProperties = {
        patient_name: patient.firstName+' '+patient.lastName,
        doctor_name: doctor.name,
        doctor_email:doctor.email,
        doctor_clinic_name:doctor.clinicName,
        payment_link: link,
        product_details: mailData,
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
      }, 120000);

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