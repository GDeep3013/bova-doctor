import fs from 'fs';
import path from 'path';
import connectDB from '../../../../../db/db';
import Doctor from '../../../../../models/Doctor';

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
      const phone = formData.get('phone');
      const userType = formData.get('userType');
      const specialty = formData.get('specialty');
      const profileImage = formData.get('profileImage');
  
      // Check for existing doctor with the same email or phone (excluding the current doctor)
      const existingDoctor = await Doctor.findOne({
        $or: [
          { email, _id: { $ne: id } },
          { phone, _id: { $ne: id } },
        ],
      });
  
      if (existingDoctor) {
        const errors = [];
        if (existingDoctor.email === email) errors.push('Email already exists');
        if (existingDoctor.phone === phone) errors.push('Phone number already exists');
        return new Response(JSON.stringify({ error: errors }), { status: 400 });
      }
  
      // If a new profile image is uploaded, handle the image deletion and upload
      let imageUrl = '';
      if (profileImage) {
        // Fetch the current doctor's data
        const currentDoctor = await Doctor.findById(id);
  
        // If the doctor already has a profile image, remove the old image from the server
        if (currentDoctor && currentDoctor.profileImage) {
          const oldImagePath = path.join(process.cwd(), 'public', currentDoctor.profileImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath); // Delete the old image
          }
        }
  
        // Use Web Crypto API to generate a unique filename
        const array = new Uint8Array(16);
        crypto.getRandomValues(array); // Generate a random value
        const uniqueFileName = `${array.join('')}${path.extname(profileImage.name)}`; // Create unique filename
  
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
  
        const uploadPath = path.join(uploadDir, uniqueFileName);
  
        // Convert the uploaded image file to buffer
        const buffer = Buffer.from(await profileImage.arrayBuffer());
  
        // Save the new image to the uploads directory
        fs.writeFileSync(uploadPath, buffer);
  
        // Set the relative URL path to the new image
        imageUrl = `/uploads/${uniqueFileName}`;
      }
  
      // Update the doctor in the database, including the new profile image if available
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        id,
        { firstName, lastName, email, phone, userType, specialty, profileImage: imageUrl },
        { new: true, runValidators: true }
      );
  
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
