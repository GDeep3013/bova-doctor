import connectDB from '../../../../db/db';
import Doctor from '../../../../models/Doctor';
import Patient from '../../../../models/patient';
import Plan from '../../../../models/plan';
import dayjs from 'dayjs';
import { createProfile, subscribeProfiles, deleteProfile } from '../../../klaviyo/klaviyo';
// Function to calculate the difference in hours
const calculateHoursDifference = (createdDate) => {
    const now = dayjs();
    const created = dayjs(createdDate);
    return now.diff(created, 'hour');
};
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET(req) {
    try {
        await connectDB();


        const doctorsWithPatients = await Patient.aggregate([
            {
                $lookup: {
                    from: "plans",
                    localField: "_id",
                    foreignField: "patient_id",
                    as: "plans"
                }
            },
            {
                $match: {
                    "plans.0": { $exists: false }
                }
            },
            {
                $group: {
                    _id: "$doctorId",
                    patients: {
                        $push: {
                            id: "$_id",
                            createdAt: "$createdAt",
                            firstName: "$firstName",
                            lastName: "$lastName",
                            email: "$email",
                            phone: "$phone"
                        }
                    },
                },
            },
        ]);

        if (!doctorsWithPatients.length) {
            return new Response(
                JSON.stringify({ message: "No doctors with patients found" }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }

        const filteredDoctors = doctorsWithPatients.filter((doc) =>
            doc.patients.some((patient) => {
                const hoursSincePatientAdded = calculateHoursDifference(patient.createdAt);
                return hoursSincePatientAdded >= 23 && hoursSincePatientAdded <= 25;
                // return patient.email =="yogeshrana.610weblab+patient@gmail.com"
                // console.log('patient',patient.email =="yogeshrana.610weblab+patient@gmail.com")
            })
        );

        if (!filteredDoctors.length) {
            return new Response(
                JSON.stringify({ message: "No doctors found who need reminders" }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }


        const doctorIds = filteredDoctors.map(doc => doc._id.toString());
        let doctors = await Doctor.find({ _id: { $in: doctorIds } })
            .select("firstName lastName email phone specialty clinicName")
            .lean();

        let allAssociatedPatients = [];
        for (const doctor of doctors) {
            const associatedPatients = doctorsWithPatients.find(d => d._id.toString() === doctor._id.toString())?.patients || [];
        
            const patientsToNotify = associatedPatients.filter(patient => {
                // console.log('patient', patient)
                // return patient.email =="yogeshrana.610weblab+patient@gmail.com"

                const hoursSincePatientAdded = calculateHoursDifference(patient.createdAt);
                return hoursSincePatientAdded >= 23 && hoursSincePatientAdded <= 25;
            });
        
            allAssociatedPatients.push(...patientsToNotify);
            
            const doctorUser = {
                email: doctor.email,
                firstName: doctor.firstName,
                lastName: doctor.lastName
            };
            
            for (const patient of patientsToNotify) {
                const customProperties = {
                    first_name: doctor.firstName,
                    last_name: doctor.lastName,
                    patient_name: `${patient.firstName} ${patient.lastName}`,
                    login_link: process.env.NEXT_PUBLIC_BASE_URL
                };
                const listId = 'VRZcut';        
                try {
                    setTimeout(async () => {
                        try {
                            await deleteProfile(doctorUser);
                        } catch (error) {
                            console.error('Error deleting profile:', error);
                        }
                    }, 60000);
                    console.log('doctorUser',doctorUser)
                    await createProfile(doctorUser, customProperties);
                    await subscribeProfiles(doctorUser, listId);
                    
                    setTimeout(async () => {
                        try {
                            await deleteProfile(doctorUser);
                        } catch (error) {
                            console.error('Error deleting profile:', error);
                        }
                    }, 60000);
                    await delay(1000);
                } catch (error) {
                    console.error('Error processing doctor:', doctor.email, error);
                }
            }
        }
        

        return new Response(
            JSON.stringify({
                message: "Reminders sent successfully",
                doctorsNotified: doctors.length,
                associatedPatients: allAssociatedPatients,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error fetching doctors:", error);
        return new Response(
            JSON.stringify({ message: "An error occurred", error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
