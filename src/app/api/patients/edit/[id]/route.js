import connectDB from '../../../../../db/db';
import Patient from '../../../../../models/patient';
import Plan from '../../../../../models/plan';
import { searchCustomer, } from '../../../../shopify-api/_shopify_api_ShopifyAPI'

export async function GET(req, { params }) {
  const { id } = params; // Get 'id' from the URL

  // Connect to the database
  await connectDB();

  try {
    const patient = await Patient.findById(id);

    if (!patient) {
      return new Response(JSON.stringify({ message: 'Patient not found' }), {
        status: 404,
      });
    }
    const plans = await Plan.find({ patient_id: id });

    const responseData = {
      patient,
      plans,
    };
    return new Response(JSON.stringify(responseData), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Error fetching patient' }),
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const { id } = params; // Get 'id' from the URL
  const { email, phone, firstName, lastName, doctorId, message } = await req.json(); // Get request body

  // Connect to the database
  await connectDB();

  try {
    const query = {
      doctorId: doctorId, // Scope check to the same doctor
      $and: [
        { _id: { $ne: id } }, // Exclude the current patient by ID
        {
          $or: [
            { email: email }, // Check if the email is already used by another patient of the same doctor
            ...(phone ? [{ phone: phone }] : []), // Add phone check only if it is provided
          ],
        },
      ],
    };

    // Check for existing patient
    const existingPatient = await Patient.findOne(query);

    if (existingPatient) {
      const errors = [];
      if (existingPatient.phone === phone) {
        errors.push('Phone number already exists');
      }
      if (existingPatient.email === email) {
        errors.push('Email already exists');
      }
      return new Response(JSON.stringify({ error: errors }), {
        status: 400,
      });
    }

    const updatedPatients = await Patient.findByIdAndUpdate(
      id,
      { email, phone, firstName, lastName, message },
      { new: true } // This option returns the updated document
    );

    const customer = await searchCustomer(firstName, lastName, email, phone);
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { customerId: customer.id },
    );
    return new Response(JSON.stringify(updatedPatient), {
      status: 200,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params; // Get 'id' from the URL

  // Connect to the database
  await connectDB();

  try {
    await Patient.findByIdAndDelete(id);
    return new Response(null, { status: 204 }); // No content
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// export async function DELETE(req, { params }) {
  //   const { id } = params; // Extract 'id' from the URL parameters
  
  //   // Ensure database connection
  //   try {
  //     await connectDB();
  //   } catch (error) {
  //     return new Response(
  //       JSON.stringify({ error: "Failed to connect to the database." }),
  //       { status: 500 }
  //     );
  //   }
  
  //   try {
  //     const patient = await Patient.findByIdAndDelete(id);
  //     if (!patient) {
  //       return new Response(
  //         JSON.stringify({ error: "Patient not found." }),
  //         { status: 404 }
  //       );
  //     }
  
  //     if (patient.customerId) {
  //       console.log(patient.customerId);
  //       try {
  //         await DeleteCustomer(patient.customerId);
  //       } catch (error) {
  //         console.error(`Failed to delete Shopify customer ID: ${patient.customerId}`, error);
  //       }
  //     }
  
  //     return new Response(null, { status: 204 }); // Successfully deleted, no content
  //   } catch (error) {
  //     return new Response(
  //       JSON.stringify({ error: "Failed to delete the patient." }),
  //       { status: 500 }
  //     );
  //   }
  // }