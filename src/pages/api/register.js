import bcrypt from 'bcrypt';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    await prisma.$connect();
    res.status(200).json({ message: "Connected to the database" });
  } catch (error) {
    console.error("Prisma connection error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
// export default async function handler(req, res) {
//     console.log('prismaprisma2',prisma)
//     if (req.method === 'POST') {
//         try {
//             const {
//                 firstName,
//                 lastName,
//                 email,
//                 password,
//                 phone,
//                 specialty
//             } = req.body;

//             const existingDoctor = await prisma.doctor.findFirst({
//                 where: {
//                     OR: [{
//                         email
//                     },
//                     {
//                         phone
//                     },
//                     ],
//                 },
//             });

//             if (existingDoctor) {
//                 const errors = [];
//                 if (existingDoctor.email === email) {
//                     errors.push('Email already exists');
//                 }
//                 if (existingDoctor.phone === phone) {
//                     errors.push('Phone number already exists');
//                 }
//                 return res.status(400).json({ error: errors });
//             }

//             // Hash the password before saving to the database
//             const hashedPassword = await bcrypt.hash(password, 10);

//             // Create a new doctor in the database
//             const newDoctor = await prisma.doctor.create({
//                 data: {
//                     firstName,
//                     lastName,
//                     email,
//                     password: hashedPassword, // Store the hashed password
//                     phone,
//                     specialty,
//                 },
//             });

//             const {
//                 password: _,
//                 ...doctorData
//             } = newDoctor; // Omit the password from the response
//             return res.status(201).json(doctorData);
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({ error: error });
//         }
//     }
// }
