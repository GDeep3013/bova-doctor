import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' ,userId:userId });
    }
    try {
      const doctors = await prisma.doctor.findMany();
      res.status(200).json(doctors);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
