import connectDB from '../../../../db/db';
import Plan from '../../../../models/plan'
import doctor from '../../../../models/Doctor'

import Patient from '../../../../models/patient';

import NextCrypto from 'next-crypto';
import nodemailer from 'nodemailer';
import { medicationPlan } from '../../../templates/medicationPlan'
import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';
import { createDiscountPriceRule, createDiscountCode } from '../../../shopify-api/_shopify_api_ShopifyAPI'

export async function POST(req) {

  await connectDB();
  const crypto = new NextCrypto();

  const {
    formData: { items, patient_id, message, discount },
    status = 'pending',
    selectedItems,
    doctor,
    doctorCommission,
    planStatus = 'ordered',
  } = await req.json();


  const planData = {
    doctorId : doctor.id,
    patient_id,
    message,
    status,
    items,
    discount,
    doctorCommission,
    planStatus,
    createdAt: new Date(),
    reminderDate:new Date(),
  };

  

  try {
    // Fetch patient details
    const patient = await Patient.findOne({ _id: patient_id });
    if (!patient) {
      return new Response(JSON.stringify({ success: false, message: "Patient not found" }), { status: 404 });
    }
    const variantGIDs = items.map(
      (item) => `gid://shopify/ProductVariant/${item.id}`
    );

    // Create price rule and discount code
    let priceRule = null;
    try {

      if (discount) {       
        priceRule = await createDiscountPriceRule(discount, patient,variantGIDs);
      }
      // if (priceRule) {
      //   discountCode = await createDiscountCode(priceRule);
      // }
    } catch (error) {
      console.error("Error creating discount code:", error.message);
    }
    // Create plan
    const plan = await Plan.create(planData);

    // Update plan with discount details if available

    if (priceRule?.codeDiscount?.codes?.nodes[0]?.code) {
      await Plan.updateOne(
        { _id: plan._id },
        {
          $set: {
            priceRuleId: "",
            discountId: priceRule?.id,
            discountCode: priceRule?.codeDiscount?.codes?.nodes[0]?.code
          },
        }
      );
    }

    // Encrypt plan ID for the payment link
    const encryptedId = await crypto.encrypt(plan._id.toString());
    const urlSafeEncryptedId = encryptedId.replace(/\//g, '-').replace(/=/g, '_');
    const link = `https://bovalabs.com/pages/view-plans?id=${urlSafeEncryptedId}`;

    // Merge selectedItems and items for mail data
    const mergeArrays = (selectedItems, items) => {
      return selectedItems.map((selectedItem) => {
        const matchingItem = items.find((item) => item.id === selectedItem.id);
        const plainDescription = selectedItem.product.descriptionHtml
          ? selectedItem.product.descriptionHtml.replace(/<[^>]*>/g, '').trim()
          : '';
        return {
          title: selectedItem.product.title || 'Untitled',
          description: plainDescription,
          image: selectedItem.product.images?.[0]?.url || null,
          properties: matchingItem?.properties || {},
        };
      });
    };
    const mailData = mergeArrays(selectedItems, items);

    // Prepare custom properties for Klaviyo
    const customProperties = {
      patient_name: `${patient.firstName} ${patient.lastName}`,
      doctor_name: doctor.name,
      doctor_email: doctor.email,
      doctor_clinic_name: doctor.clinicName,
      payment_link: link,
      product_details: mailData,
    };

    // Klaviyo actions
    try {
      const listId = 'XY5765';
        try {
          await deleteProfile(patient);
        } catch (error) {
          console.error('Error deleting profile:', error);
        }

      
      const createProfilePromise = createProfile(patient, customProperties);
      const subscribeProfilePromise = subscribeProfiles(patient, listId);


      await Promise.all([createProfilePromise, subscribeProfilePromise]);

    } catch (error) {
      console.error('Error handling Klaviyo actions:', error.message);
    }

    return new Response(JSON.stringify({ success: true, data: plan }), { status: 201 });
  } catch (error) {
    console.error("Error processing request:", error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
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