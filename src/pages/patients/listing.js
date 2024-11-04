import AppLayout from '../../components/Applayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
export default function Listing() {
    const { data: session } = useSession();
    console.log('sessionsession',session?.user?.id)

    const [patients, setPatients] = useState([]);
    const router = useRouter();

    const handleDelete = async (id) => {
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
                const response = await fetch(`/api/patients/profile/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error("Failed to delete patient");
                }
                setPatients(patients.filter(patient => patient.id !== id));
                Swal.fire(
                    'Deleted!',
                    'Your patient has been deleted.',
                    'success'
                );
            } catch (error) {
                console.log(error.message);
            }
        }
    };

    const handleEdit = (id) => {
        router.push(`/patients/edit/${id}`);
    };

    const fetchPatients = async () => {
        try {
            const response = await fetch(`/api/patients/getPatients?userId=${session?.user?.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch patients");
            }
            const data = await response.json();
            console.log(data)
            setPatients(data);
        } catch (error) {
            setError(error.message);
        }
    }

    useEffect(() => {
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
