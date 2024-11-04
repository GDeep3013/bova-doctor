import { useEffect, useState } from 'react';
import AppLayout from '../../components/Applayout';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

export default function Listing() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter(); // 
    const handleDelete = async (id) => {
        // Show confirmation dialog using SweetAlert2
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Once deleted, you will not be able to recover this patient!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/patients/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error("Failed to delete patient");
                }

                // Remove the deleted patient from the state
                setPatients(patients.filter(patient => patient.id !== id));
                Swal.fire(
                    'Deleted!',
                    'Your patient has been deleted.',
                    'success'
                );
            } catch (error) {
                setError(error.message);
            }
        }
    };

    const handleEdit = (id) => {
        // Redirect to the edit page
        router.push(`/patients/edit/${id}`);
    };
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



    return (
        <AppLayout>
            <div className="container mx-auto mt-5">
                <h1 className="text-2xl font-bold mb-4">Patient List</h1>
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="py-2 px-4 text-left text-gray-600">Name</th>
                            <th className="py-2 px-4 text-left text-gray-600">Email</th>
                            <th className="py-2 px-4 text-left text-gray-600">Phone</th>
                            <th className="py-2 px-4 text-left text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-gray-50 border-b">
                                <td className="py-2 px-4">{patient.firstName} {patient.lastName}</td>
                                <td className="py-2 px-4">{patient.email}</td>
                                <td className="py-2 px-4">{patient.phone || "Not available"}</td>
                                <td className="py-2 px-4">
                                    <button
                                        onClick={() => handleEdit(patient.id)}
                                        className="text-blue-600 hover:underline mr-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(patient.id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
