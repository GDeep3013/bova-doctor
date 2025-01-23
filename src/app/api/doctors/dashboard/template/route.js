import dbConnect from "../../../../../db/db"; // Ensure this path is correct
import Patient from "../../../../../models/patient"; // Ensure this path is correct
import Plan from "../../../../../models/plan"; // Ensure this path is correct
import Template from "../../../../../models/themeTemplate"; // Ensure this path is correct

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = req.nextUrl;
        const doctorId = searchParams.get('doctorId');
        const messageType = searchParams.get('type');
       
        if (!doctorId) {
            return new Response(
                JSON.stringify({ success: false, error: "Doctor ID is required" }),
                { status: 400 }
            );
        }

        const patients = await Patient.find({ doctorId });
        const patientIds = patients.map((patient) => patient._id);

        const totalPlans = await Plan.countDocuments({ patient_id: { $in: patientIds } });
        let template;
        // if (totalPlans >= 1) {
        //     template = await Template.findOne({ doctorType: messageType });
        // } else {
        //     template = await Template.findOne({ doctorType:messageType });
        // }
        template = await Template.findOne({ doctorType:messageType });
        if (template) {
            return new Response(
                JSON.stringify({ success: true, data: template }),
                { status: 200 }
            );
        } else {
            return new Response(
                JSON.stringify({ success: false, error: "Template not found" }),
                { status: 404 }
            );
        }
    } catch (error) {
        // Handle server errors
        console.error("Error fetching templates:", error);
        return new Response(
            JSON.stringify({ success: false, error: "Internal Server Error" }),
            { status: 500 }
        );
    }
}
