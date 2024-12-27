import fs from 'fs';
import path from 'path';
import connectDB from '../../../../../db/db';
import Doctor from '../../../../../models/Doctor';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../../klaviyo/klaviyo';

connectDB();

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return new Response(JSON.stringify({ message: 'doctor not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(doctor), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, message: 'Error fetching doctor' }), { status: 500 });
  }
}

// export async function PUT(req, { params }) {
//     const { id } = params;
//     const { firstName, lastName, email, phone, userType, specialty } = await req.json();
//     try {
//         const existingDoctor = await Doctor.findOne({
//             $or: [
//                 { email, _id: { $ne: id } },
//                 { phone, _id: { $ne: id } }, 
//             ],
//         });
//         if (existingDoctor) {
//            const errors = [];
//             if (existingDoctor.email === email) errors.push('Email already exists');
//             if (existingDoctor.phone === phone) errors.push('Phone number already exists');
//             return new Response(JSON.stringify({ error: errors }), { status: 400 });        }

//         const updatedDoctor = await Doctor.findByIdAndUpdate(
//             id,
//             { firstName, lastName, email, phone, userType, specialty },
//             { new: true, runValidators: true }
//         );

//         return new Response(JSON.stringify(updatedDoctor), { status: 200 });
//     } catch (error) {
//         console.error(error);
//         return new Response(JSON.stringify({ error: error.message, message: 'Error updating doctor' }), { status: 500 });
//     }
// }

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const formData = await req.formData(); // Use formData to retrieve file data

    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');

    let phone = formData.get('phone');
    phone = phone ? phone.trim() : '';
    const userType = formData.get('userType');
    const specialty = formData.get('specialty');
    const clinicName = formData.get('clinicName');
    const commissionPercentage = formData.get('commissionPercentage');

    // Check for existing doctor with the same email or phone (excluding the current doctor)
    const query = {
      $or: [
        { email, ...(id ? { _id: { $ne: id } } : {}) },
        ...(phone ? [{ phone, ...(id ? { _id: { $ne: id } } : {}) }] : []),
      ],
    };

    const existingDoctor = await Doctor.findOne(query);
    if (existingDoctor) {
      const errors = [];
      if (existingDoctor.email === email) errors.push('Email already exists');
      if (phone && existingDoctor.phone === phone) errors.push('Phone number already exists');
      return new Response(JSON.stringify({ error: errors }), { status: 400 });
    }

    const currentDoctor = await Doctor.findById(id);
    if (!currentDoctor) {
      return new Response(JSON.stringify({ error: 'Doctor not found' }), { status: 404 });
    }
    const oldEmail = currentDoctor.email;
    const isEmailUpdated = oldEmail !== email;
    // If a new profile image is uploaded, handle the image deletion and upload

    // Update the doctor in the database, including the new profile image if available
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { firstName, lastName, email, phone, userType, clinicName, specialty, commissionPercentage },
      { new: true, runValidators: true }
    );
    if (isEmailUpdated) {

      try {

        // console.log(oldEmail, firstName, lastName ,'users');
        const user = { email: oldEmail, firstName, lastName };
        const customProperties = {
          user_name: `${firstName} ${lastName}`,
          user_email: email,
        };
        const listId = 'WPB4EV';

        setTimeout(async () => {
          try {
            await deleteProfile(user);
          } catch (error) {
            console.error('Error deleting profile:', error);
          }
        }, 60000);


        const createProfilePromise = createProfile(user, customProperties);
        const subscribeProfilePromise = subscribeProfiles(user, listId);

        setTimeout(async () => {
          try {
            const deleteProfileResponse = await deleteProfile(user);
          } catch (error) {
            console.error('Error deleting profile:', error);
          }
        }, 60000);

        const [createResponse, subscribeResponse] = await Promise.all([
          createProfilePromise,
          subscribeProfilePromise,
        ]);
      } catch (error) {
        console.error('Error handling Klaviyo actions:', error);
      }
    }
    return new Response(JSON.stringify(updatedDoctor), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message, message: 'Error updating doctor' }), { status: 500 });
  }
}



export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await Doctor.findByIdAndDelete(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, message: 'Error deleting doctor' }), { status: 500 });
  }
}
