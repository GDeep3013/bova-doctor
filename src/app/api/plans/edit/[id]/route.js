import connectDB from '../../../../../db/db';
import Patient from '../../../../../models/patient';
import Plan from '../../../../../models/plan'

import NextCrypto from 'next-crypto';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { medicationPlan } from '../../../../templates/medicationPlan'
import { createProfile, subscribeProfiles, deleteProfile } from '../../../../klaviyo/klaviyo';
import { createDiscountPriceRule, createDiscountCode, updateDiscountPriceRule, DeleteDiscountCode } from '../../../../shopify-api/_shopify_api_ShopifyAPI'

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
  const {
    formData: { items, patient_id, message, discount },
    status = 'pending',
    planStatus = 'ordered',
    selectedItems,
    doctor,
    doctorCommission } = await req.json();
  try {
    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      { items, status, patient_id, message, discount, doctorCommission, planStatus, updatedAt: new Date() ,reminderDate:new Date(),},
      { new: true }
    ).populate('patient_id');

    const patient = await Patient.findById(patient_id);
    if (!patient) {
      return new Response(JSON.stringify({ success: false, message: "Patient not found" }), { status: 404 });
    }

    let priceRule = null;
    try {
      await DeleteDiscountCode(updatedPlan?.discountId);
      if (discount) {
        priceRule = await createDiscountPriceRule(discount, patient);
      }
      // priceRule = await createDiscountPriceRule(discount, patient);
      // if (priceRule) {
      //   discountCode = await createDiscountCode(priceRule);
      // }
    } catch (error) {
      console.error("Error creating discount code:", error.message);
    }



    // Update plan with discount details if available
    if (priceRule?.codeDiscount?.codes?.nodes[0]?.code) {
      await Plan.updateOne(
        { _id: updatedPlan._id },
        {
          $set: {
            priceRuleId: "",
            discountId: priceRule?.id,
            discountCode: priceRule?.codeDiscount?.codes?.nodes[0]?.code
          },
        }
      );
    }

    if (!updatedPlan) {
      return new Response(JSON.stringify({ success: false, message: 'Plan not found' }), { status: 404 });
    }
    const encryptedId = await crypto.encrypt(updatedPlan._id.toString());

    // Make the encrypted ID URL-safe by replacing `/` and `=` characters
    const urlSafeEncryptedId = encryptedId
      .replace(/\//g, '-')  // Replace `/` with `-`
      .replace(/\=/g, '_'); // Replace `=` with `_`

    const link = ` https://bovalabs.com//pages/view-plans?id=${urlSafeEncryptedId}`;



    if (!patient) {
      return new Response(JSON.stringify({ success: false, message: 'Patient not found' }), { status: 404 });
    }
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

    try {
      const customProperties = {
        patient_name: patient.firstName + ' ' + patient.lastName,
        doctor_name: doctor.name,
        doctor_email: doctor.email,
        doctor_clinic_name: doctor.clinicName,
        payment_link: link,
        product_details: mailData,
      };
      const listId = 'XY5765';
      setTimeout(async () => {
        try {
          await deleteProfile(patient);
        } catch (error) {
          console.error('Error deleting profile:', error);
        }
      }, 60000);

      const createProfilePromise = createProfile(patient, customProperties);
      const subscribeProfilePromise = subscribeProfiles(patient, listId);

      setTimeout(async () => {
        try {
          const deleteProfileResponse = await deleteProfile(patient);
        } catch (error) {
          console.error('Error deleting profile:', error);
        }
      }, 120000);

      await Promise.all([createProfilePromise, subscribeProfilePromise]);
    }
    catch (error) {
      console.error('Error handling Klaviyo actions:', error);
    }


    return new Response(JSON.stringify({ success: true, data: updatedPlan }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}


export async function DELETE(req, { params }) {
  const { id } = params; // Get 'id' from the URL

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
