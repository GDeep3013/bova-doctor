'use client'
import AppLayout from '../../../../components/Applayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { DeleteIcon, EditIcon } from 'components/svg-icons/icons';
import Loader from 'components/loader';
export default function DoctorListing() {
    const { data: session } = useSession();
    const [doctors, setDoctors] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10); // Set the limit of doctors per page
    const router = useRouter();
    const [fetchLoader, setFetchLoader] = useState(false);

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
            setFetchLoader(true)
            const response = await fetch(`/api/doctors/getDoctors?userId=${session?.user?.id}&page=${currentPage}&limit=${limit}`);
            if (!response.ok) {
                throw new Error("Failed to fetch doctors");
            }
            const data = await response.json();
            setDoctors(data.data);
            setTotalPages(data.pagination.totalPages);
            setFetchLoader(false);
        } catch (error) {
            // console.log(error.message);
            setFetchLoader(false);
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchDoctors(page);
        }
    }, [session, page]);
    return (
        <AppLayout>
            <div className="mx-auto">
                {fetchLoader?<Loader/>:<>
                <div className='flex justify-between items-start mt-4 md:mt-2 mb-4 md:mb-2'>
                    <div>
                        <h1 className="text-2xl">Doctors Listing</h1>
                        <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>
                    </div>
                    <Link href='/admin/doctor/create' className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 text-center hover:bg-inherit min-w-[130px]">
                        Add Doctor
                    </Link>
                </div>

                <div className='overflow-hidden overflow-x-auto max-w-full w-full'>
                    <table className="min-w-[max-content] w-full bg-white doctor-listing rounded-[8px]">
                        <thead>
                            <tr className="bg-gray-100 border-b"> 
                                <th className="py-2 px-4 text-left text-[#53595B] ">Serial No.</th>
                                <th className="py-2 px-4 text-left text-[#53595B] ">Name</th>
                                <th className="py-2 px-4 text-left text-[#53595B] ">Email</th>
                                <th className="py-2 px-4 text-left text-[#53595B] ">Phone</th>
                                <th className="py-2 px-4 text-left text-[#53595B] ">Speciality</th>
                                <th className="py-2 px-4 text-left text-[#53595B] ">Commission %</th>
                                <th className="py-2 px-4 text-left text-[#53595B] ">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-2 px-4 text-center text-gray-500 border-r border-[#B0BAAE]">
                                        No records found
                                    </td>
                                </tr>
                            ) : doctors.map((doctor, index) => (
                                <tr key={doctor._id} className="hover:bg-gray-50">     
                                    <td className='w-[100px] text-center py-2 px-4' > {index + 1}</td>

                                    <td className="py-2 px-4">{doctor.firstName} {doctor.lastName}</td>
                                    <td className="py-2 px-4">{doctor.email}</td>
                                    <td className="py-2 px-4">{doctor.phone || "Not available"}</td>
                                    <td className="py-2 px-4">{doctor.specialty || "Not available"}</td>
                                    <td className="py-2 px-4">{doctor.commissionPercentage || "Not available"}</td>
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
                </div>
                <div className="flex justify-end items-center space-x-4 mt-6">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className={`px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg transition duration-200 ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-customBg2'
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
                        className={`px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg transition duration-200 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-customBg2'
                            }`}
                    >
                        Next
                    </button>
                </div>
                </>}
            </div>
        </AppLayout>
    );
}
