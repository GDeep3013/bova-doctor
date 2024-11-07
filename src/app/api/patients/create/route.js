// src/app/api/patients/create/route.js
import { NextResponse } from 'next/server';  // Import NextResponse for handling responses
import connectDB from '../../../../db/db';  // Adjust path based on your folder structure
import Patient from '../../../../models/patient';

export async function POST(req) {
  // Connect to the database
  await connectDB();

  const { firstName, lastName, email, phone, doctorId ,message} = await req.json();  // Use req.json() for parsing the request body

  // Server-side validation
  if (!firstName || !lastName || !email || !doctorId) {
    return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
  }

  try {
    // Check if a patient already exists with the same email or phone for the same doctor
    const existingPatient = await Patient.findOne({
      doctorId,  // Ensure it's for the same doctor
      $or: [
        { email: email }, // Check if the email already exists for this doctor
        { phone: phone },  // Check if the phone already exists for this doctor
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
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    // Create a new patient in the database associated with the doctor's ID
    const newPatient = await Patient.create({
      firstName,
      lastName,
      email,
      phone,
      doctorId,
      message
    });

    // Return success message
    return NextResponse.json({ message: 'Patient created successfully', patient: newPatient }, { status: 201 });

  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
