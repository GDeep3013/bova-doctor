'use client';
import AppLayout from '../../../../components/Applayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { DeleteIcon, EditIcon } from 'components/svg-icons/icons';

export default function DoctorListing() {
    const { data: session } = useSession();
    const [doctors, setDoctors] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10); // Set the limit of doctors per page
    const router = useRouter();

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Once deleted, you will not be able to recover this doctor!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        });
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/doctors/edit/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error("Failed to delete doctor");
                }
                setDoctors(doctors.filter(doctor => doctor._id !== id));
                Swal.fire('Deleted!', 'Doctor has been deleted.', 'success');
            } catch (error) {
                console.log(error.message);
            }
        }
    };

    const handleEdit = (id) => {
        router.push(`/admin/doctor/edit/${id}`);
    };

    const fetchDoctors = async (currentPage = 1) => {
        try {
            const response = await fetch(`/api/doctors/getDoctors?userId=${session?.user?.id}&page=${currentPage}&limit=${limit}`);
            if (!response.ok) {
                throw new Error("Failed to fetch doctors");
            }
            const data = await response.json();
            setDoctors(data.data);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.log(error.message);
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchDoctors(page);
        }
    }, [session, page]);

    return (
        <AppLayout>
            <div className="container mx-auto mt-5">
                <div className='flex justify-between'>
                    <h1 className="text-2xl font-bold mb-4">Doctors Listing</h1>
                    <Link href='/admin/doctor/create' className="min-w-[150px] p-[14px] float-right mb-2 py-2 text-center bg-black text-white font-medium rounded hover:bg-customText focus:outline-none" >
                        Add Doctor
                    </Link>
                </div>

                <table className="min-w-full bg-white doctor-listing rounded-[8px]">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="py-2 px-4 text-left text-gray-600">Name</th>
                            <th className="py-2 px-4 text-left text-gray-600">Email</th>
                            <th className="py-2 px-4 text-left text-gray-600">Phone</th>
                            <th className="py-2 px-4 text-left text-gray-600">Speciality</th>
                            <th className="py-2 px-4 text-left text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-2 px-4 text-center text-gray-500">
                                    No records found
                                </td>
                            </tr>
                        ) : doctors.map((doctor) => (
                            <tr key={doctor._id} className="hover:bg-gray-50 border-b">
                                <td className="py-2 px-4">{doctor.firstName} {doctor.lastName}</td>
                                <td className="py-2 px-4">{doctor.email}</td>
                                <td className="py-2 px-4">{doctor.phone || "Not available"}</td>
                                <td className="py-2 px-4">{doctor.specialty || "Not available"}</td>
                                <td className="py-2 px-4">
                                    <button
                                        onClick={() => handleEdit(doctor._id)}
                                        className="text-blue-600 hover:underline mr-2"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doctor._id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-center items-center space-x-4 mt-6">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className={`px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg transition duration-200 ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                            }`}
                    >
                        Previous
                    </button>
                    <span className="text-gray-700">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className={`px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg transition duration-200 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}