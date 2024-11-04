import prisma from '../../../lib/prisma';
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const doctors = await prisma.patient.findMany();
      res.status(200).json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
