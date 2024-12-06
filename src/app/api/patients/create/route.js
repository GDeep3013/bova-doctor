// src/app/api/patients/create/route.js
// Import NextResponse for handling responses
import connectDB from '../../../../db/db';  // Adjust path based on your folder structure
import Patient from '../../../../models/patient';
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
export async function POST(req) {
  // Connect to the database
  await connectDB();

  const { firstName, lastName, email, phone = null, doctorId, message } = await req.json(); // Parse request body

  // Server-side validation
  if (!firstName || !lastName || !email || !doctorId) {
    return Response.json({ error: 'Required fields are missing' }, { status: 400 });
  }

  try {
    // Build query to check for existing patients
    const query = {
      doctorId,
      $or: [{ email }],
    };

    if (phone) {
      query.$or.push({ phone });
    }

    // Check for existing patient
    const existingPatient = await Patient.findOne(query);
    if (existingPatient) {
      const errors = [];
      if (phone && existingPatient.phone === phone) {
        errors.push('Phone number already exists');
      }
      if (existingPatient.email === email) {
        errors.push('Email already exists');
      }
      return Response.json({ error: errors }, { status: 400 });
    }

    // Create a new patient
    const newPatient = await Patient.create({
      firstName,
      lastName,
      email,
      phone,
      doctorId,
      message,
    });

    // Create a Shopify customer and link it
    try {
      const customer = await createCustomer(firstName, lastName, email, newPatient);
      return Response.json(
        {
          message: 'Patient created successfully',
          patient: newPatient,
          shopifyCustomer: customer,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating Shopify customer:', error);
      return Response.json(
        { message: 'Patient created but failed to create Shopify customer', patient: newPatient },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error creating patient:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createCustomer(firstName, lastName, email, newPatient) {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/customers.json`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        customer: {
          email: email,
          first_name: firstName,
          last_name: lastName,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Shopify API error creating customer: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Update the patient document with the new customer ID
    const updatedPatient = await Patient.findByIdAndUpdate(
      newPatient._id, 
      { customerId: data.customer.id },
    );

    console.log('Customer ID updated successfully', updatedPatient);
    return data.customer;
  } catch (error) {
    console.error("Error creating customer:", error.message);
    throw error;
  }
}



