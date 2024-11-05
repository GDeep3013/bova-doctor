import connectDB from '../../../db/db';
import Doctor from '../../../models/Doctor';

export default async function handler(req, res) {
  connectDB()
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required', userId: userId });
    }
    const doctors = await Doctor.find({ _id: { $ne: userId } });
       res.status(200).json(doctors);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
