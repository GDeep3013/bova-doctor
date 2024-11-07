'use client';
import AppLayout from '../../../../components/Applayout';
import {  getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function DoctorListing () {
    const { data: session } = useSession();

    console.log(session?.user?.id)
    const [doctors, setDoctors] = useState([]);
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
                setDoctors(doctors.filter(doctors => doctors._id !== id));
                Swal.fire(
                    'Deleted!',
                    'Doctor has been deleted.',
                    'success'
                );
            } catch (error) {
                console.log(error.message);
            }
        }
    };

    const handleEdit = (id) => {
        router.push(`/admin/doctor/edit/${id}`);
    };
    
    const fetchDoctors = async () => {
        try {
            const response = await fetch(`/api/doctors/getDoctors?userId=${session?.user?.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch doctors");
            }
            const data = await response.json();
            setDoctors(data);
           
        } catch (error) {
            console.log(error.message);
        }
    }
    const currentUserId = session?.user?.id;
    useEffect(() => {
        if (currentUserId) {
            
            fetchDoctors();
        }
    }, [currentUserId]);
    return (
        <AppLayout>
            <div className="container mx-auto mt-5">
                <h1 className="text-2xl font-bold mb-4">Doctors List</h1>
                <Link href='/admin/doctor/create' className="min-w-[150px]  p-[14px] float-right  mb-2 py-2 bg-customBg2 text-white font-medium rounded hover:bg-customText focus:outline-none" >
                    Add Doctor
                </Link>
                <table className="min-w-full bg-white border border-gray-200">
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
                                <td colSpan={4} className="py-2 px-4 text-center text-gray-500">
                                    No records found
                                </td>
                            </tr>
                        ) : doctors.filter(doctor => doctor.id !== currentUserId).map((doctor) => (
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
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doctor._id)}
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
