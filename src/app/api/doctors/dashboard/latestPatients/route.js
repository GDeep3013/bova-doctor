// app/api/latestPatients/route.js

import dbConnect from "../../../../../db/db"; // Ensure this path is correct
import Patient from "../../../../../models/patient"; // Ensure this path is correct

export async function GET(req) {
    try {
        // Connect to the database
        await dbConnect();

        // Extract the doctor's ID from the query parameters
        const { searchParams } = req.nextUrl;
        const doctorId = searchParams.get('doctorId');

        // Validate that the doctorId is provided
        if (!doctorId) {
            return new Response(
                JSON.stringify({ success: false, error: "Doctor ID is required" }),
                { status: 400 }
            );
        }

        // Fetch the latest two patients for the given doctor, sorted by creation date
        const latestPatients = await Patient.find({ doctorId }) // Filter by doctorId
            .sort({ createdAt: -1 }) // Sort by creation date in descending order
            .limit(2);

        // Return the response as JSON
        return new Response(
            JSON.stringify({ success: true, data: latestPatients }),
            { status: 200 }
        );
    } catch (error) {
        // Handle server errors
        console.error("Error fetching latest patients:", error);
        return new Response(
            JSON.stringify({ success: false, error: "Internal Server Error" }),
            { status: 500 }
        );
    }
}
