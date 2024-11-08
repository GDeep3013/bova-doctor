import connectDB from '../../../../../db/db';
import Patient from '../../../../../models/patient';

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

    return new Response(JSON.stringify(patient), {
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
  const { email, phone, firstName, lastName, doctorId ,message } = await req.json(); // Get request body

  // Connect to the database
  await connectDB();

  try {
    const existingPatient = await Patient.findOne({
      doctorId: doctorId, // Scope check to the same doctor
      $and: [
        { _id: { $ne: id } }, // Exclude the current patient by ID
        {
          $or: [
            { email: email }, // Check if the email is already used by another patient of the same doctor
            { phone: phone }, // Check if the phone is already used by another patient of the same doctor
          ],
        },
      ],
    });

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

    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { email, phone, firstName, lastName ,message},
      { new: true } // This option returns the updated document
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