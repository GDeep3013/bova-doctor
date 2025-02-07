import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import Patient from '../../../../models/patient';
import Plan from '../../../../models/plan';
// import sendReminderEmail from '../../../utils/sendReminderEmail'; // Utility function for sending emails
import dayjs from 'dayjs';

// Function to calculate the difference in hours using minutes
function calculateHoursDifference(createdDate) {
    const now = dayjs();
    const created = dayjs(createdDate);
    const diffInMinutes = now.diff(created, 'minute'); // Get difference in minutes
    return diffInMinutes / 60; // Convert minutes to hours
}

export async function GET(req) {
    // try {
    //     await connectDB();

    //     // Get timestamp for 24 hours ago
    //     const twentyFourHoursAgo = dayjs().subtract(24, 'hour').toDate();

    //     // Step 1: Get doctors with patients
    //     const doctorsWithPatients = await Patient.aggregate([
    //         {
    //             $group: {
    //                 _id: "$doctorId",
    //                 patients: {
    //                     $push: {
    //                         id: "$_id",
    //                         createdAt: "$createdAt",
    //                         firstName: "$firstName",
    //                         lastName: "$lastName",
    //                         email: "$email",
    //                         phone: "$phone"
    //                     }
    //                 },
    //             },
    //         },
    //     ]);

    //     if (!doctorsWithPatients.length) {
    //         return new Response(
    //             JSON.stringify({ message: "No doctors with patients found" }),
    //             { status: 200, headers: { "Content-Type": "application/json" } }
    //         );
    //     }

    //     // Step 2: Get patients with a plan created in the last 24 hours
    //     const doctorsWithRecentPlans = await Plan.distinct("patient_id", {
    //         createdAt: { $gte: twentyFourHoursAgo },
    //     });

    //     // Step 3: Filter doctors who have patients but no plans in the last 24 hours
    //     const filteredDoctors = doctorsWithPatients.filter((doc) =>
    //         doc.patients.some((patient) => {
    //             const hoursSincePatientAdded = calculateHoursDifference(patient.createdAt);
    //             return hoursSincePatientAdded >= 23 && hoursSincePatientAdded <= 25 &&
    //                 !doctorsWithRecentPlans.includes(patient.id.toString());
    //         })
    //     );

    //     if (!filteredDoctors.length) {
    //         return new Response(
    //             JSON.stringify({ message: "No doctors found who need reminders" }),
    //             { status: 200, headers: { "Content-Type": "application/json" } }
    //         );
    //     }


    //     const doctorIds = filteredDoctors.map(doc => doc._id.toString());
    //     let doctors = await Doctor.find({ _id: { $in: doctorIds } })
    //         .select("firstName lastName email phone specialty clinicName")
    //         .lean();

    //     // Step 5: Attach patient details to each doctor & send email
    //     for (const doctor of doctors) {
    //         const associatedPatients = doctorsWithPatients.find(d => d._id.toString() === doctor._id.toString())?.patients || [];
    //         const doctorUser = { email: doctor.email, firstName: doctor.firstName, lastName: doctor.lastName };
    //         // associatedPatients.map(patient => 
    //         // const customProperties = {
    //         //     patientfirstName: doctor.firstName,
    //         //     patientlastName: doctor.lastName,
    //         //     patientEmail: patient.email
    //         // };)
    //         const emailContent = `
    //             <h2>Reminder: You haven't created a plan for your patient(s)</h2>
    //             <p>Dear Dr. ${doctor.firstName} ${doctor.lastName},</p>
    //             <p>It has been 24 hours since you added the following patient(s), but no treatment plan has been created.</p>
    //             <h3>Patient Details:</h3>
    //             <ul>
    //                 ${associatedPatients.map(patient => `
    //                     <li>
    //                         <strong>Name:</strong> ${patient.firstName} ${patient.lastName} <br>
    //                         <strong>Email:</strong> ${patient.email} <br>
    //                         <strong>Phone:</strong> ${patient.phone} <br>
    //                     </li>
    //                 `).join('')}
    //             </ul>
    //             <p>Please log in and create a treatment plan as soon as possible.</p>
    //             <p>Best Regards,</p>
    //             <p>Your Clinic Team</p>
    //         `;

    //         // Send email
    //         // await sendReminderEmail(doctor.email, "Patient Plan Reminder", emailContent);
    //         console.log(`Reminder sent to: ${emailContent}`);
    //     }

    //     return new Response(
    //         JSON.stringify({ message: "Reminders sent successfully", doctorsNotified: doctors.length }),
    //         { status: 200, headers: { "Content-Type": "application/json" } }
    //     );

    // } catch (error) {
    //     console.error("Error fetching doctors:", error);
    //     return new Response(
    //         JSON.stringify({ message: "An error occurred", error: error.message }),
    //         { status: 500, headers: { "Content-Type": "application/json" } }
    //     );
    // }
};
