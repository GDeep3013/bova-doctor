import connectDB from '../../../../db/db';
import Plan from '../../../../models/plan';
import NextCrypto from 'next-crypto';
export async function GET(req, { params }) {


  const APP_HEADERS = {
    'Access-Control-Allow-Origin': '*',  // replace with your actual origin if needed
    'Access-Control-Allow-Methods': 'GET, DELETE, PATCH, POST, PUT',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  };
    connectDB()
    const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({ success: false, message: 'Plan ID is required' }),
      { status: 400, headers: APP_HEADERS, }
    );
  }

  try {
    // Decrypt the plan ID
      const crypto = new NextCrypto();
      const originalEncryptedId = id
      .replace(/-/g, '/')
      .replace(/_/g, '=');
    const planId = await crypto.decrypt(originalEncryptedId); // Decrypt the ID

    if (!planId) {
      return new Response(
        JSON.stringify({ success: false,planId:planId,id:id, message: 'Invalid plan ID' }),
        { status: 400, headers: APP_HEADERS, }
      );
    }

    // Retrieve the plan by its decrypted ID
    const plan = await Plan.findById(planId).populate({
      path: 'patient_id', // Populates the patient data
      populate: {
        path: 'doctorId', // Populates the doctor data from the patient's doctorId field
        model: 'Doctor',
      },
    });

    if (!plan) {
      return new Response(
        JSON.stringify({ success: false, message: 'Plan not found' }),
        { status: 404, headers: APP_HEADERS, }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: plan }),
      {
        status: 200,
        headers: APP_HEADERS,
      }
    );

  } catch (error) {
    console.error('Error fetching plan:', error);  // Useful for debugging
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500 , headers: APP_HEADERS,}
    );
  }
}
