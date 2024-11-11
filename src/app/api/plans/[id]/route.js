import connectDB from '../../../../db/db';
import Plan from '../../../../models/plan'
import NextCrypto from 'next-crypto';

export async function GET(req, { params }) {
    const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({ success: false, message: 'Plan ID is required' }),
      { status: 400 }
    );
  }

    try {
      
      const crypto = new NextCrypto();
      const originalEncryptedId = id
      .replace(/-/g, '/')
      .replace(/_/g, '=');
    const planId = await crypto.decrypt(originalEncryptedId); 

    if (!planId) {
      return new Response(
        JSON.stringify({ success: false,planId:planId,id:id, message: 'Invalid plan ID' }),
        { status: 400 }
      );
    }

    // Retrieve the plan by its decrypted ID
    const plan = await Plan.findById(planId);

    if (!plan) {
      return new Response(
        JSON.stringify({ success: false, message: 'Plan not found' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: plan }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching plan:', error);  // Useful for debugging
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500 }
    );
  }
}
