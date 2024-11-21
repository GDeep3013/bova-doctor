// app/api/latestPatients/route.js

import dbConnect from "../../../../../db/db"; // Ensure this path is correct
import Patient from "../../../../../models/patient"; // Ensure this path is correct

export async function GET(req) {
    try {
        // Connect to the database
        await dbConnect();

        // Fetch the latest two patients sorted by creation date
        const latestPatients = await Patient.find()
            .sort({ createdAt: -1 }) // Sort by creation date in descending order
            .limit(2);
    
        // Return the response as JSON
        return new Response(JSON.stringify({ success: true, data: latestPatients }), { status: 200, });
    } catch (error) {
        // Handle server errors
        return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
            status: 500,
       
        });
    }
}
