import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('prisma',prisma)
  try {
    // Correctly using findMany to retrieve users
      
    //   const newDoctor = await prisma.doctor.create({
    //     data: {
    //         firstName:"Test",
    //         lastName:"testUser2",
    //         email:"610wedblab@gmail.com",
    //         password: "doctor@610",
    //         phone:"8523147852",
    //         specialty:"Brain",
    //     },
    // });
    // console.log(newDoctor);
  } catch (error) {
    console.error("Database connection error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
