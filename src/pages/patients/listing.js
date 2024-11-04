import { useEffect, useState } from 'react';
import AppLayout from '../../components/Applayout';

export default function Listing() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patients/listing');
        if (!response.ok) {
          throw new Error("Failed to fetch patients");
        }
          const data = await response.json();
          console.log(data)
        setPatients(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

    return (
        
        <AppLayout>
    <div>
      <h1>Patient List</h1>
      <ul>
        {patients.map((patient) => (
          <li key={patient.id}>
                <h2>Name: {patient.firstName}  {patient.lastName}</h2>
            <p>Email: {patient.email}</p>
            <p>Phone: {patient.phone || "Not available"}</p>
          </li>
        ))}
      </ul>
        </div>
        </AppLayout>
  );
}
