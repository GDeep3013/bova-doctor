import connectDB from '../../../db/db';
import Patient from '../../../models/patient';
export default async function handler(req, res) {
  connectDB()
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' ,userId:userId });
    }
    try {
      const doctors = await Patient.find({doctorId: userId});
      res.status(200).json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ error: "Failed to fetch patients" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
