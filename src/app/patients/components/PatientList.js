'use client';
import AppLayout from '../../../components/Applayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { DeleteIcon, EditIcon } from 'components/svg-icons/icons';
import Link from 'next/link'
import Loader from 'components/loader';

export default function PatientList() {
    const { data: session } = useSession();
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState("");
    const [fetchLoader, setFetchLoader] = useState(false);
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

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
                const response = await fetch(`/api/patients/edit/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error("Failed to delete patient");
                }
                setPatients(patients.filter(patient => patient._id !== id));
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
    function formatPhoneNumber(phoneNumber) {
        if (!phoneNumber) return phoneNumber; // Return as is if not 10 digits

        return `${phoneNumber.slice(0, 5)}-${phoneNumber.slice(5)}`;
    }

    const handleEdit = (id) => {
        router.push(`/patients/edit/${id}`);
    };

    const handleView = (id) => {
        router.push(`/patients/detail/${id}`);
    };
    const fetchPatients = async (currentPage = 1) => {
        try {
            setFetchLoader(true)
            const response = await fetch(`/api/patients/getPatients?userId=${session?.user?.id}&page=${currentPage}&limit=${limit}`);
            if (!response.ok) {
                throw new Error("Failed to fetch patients");
            }
            const data = await response.json();

            setPatients(data.patients);
            setFetchLoader(false)
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            setError(error.message);
            setFetchLoader(false)
        }
    }

    useEffect(() => {
        fetchPatients(page);
    }, [session,page]);



    return (
        <AppLayout>
            <div className="mx-auto">
                {fetchLoader?<Loader/>:<>
                <div className='flex justify-between mt-4 md:mt-2 mb-6'>
                    <h1 className="text-2xl">Patient List</h1>
                    <Link href='/patients/create' className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-inherit min-w-[130px] text-center" >
                        Add Patient
                    </Link>
                </div>
                <div className='overflow-hidden overflow-x-auto max-w-full w-full'>
                <table className="min-w-[max-content] w-full bg-white doctor-listing rounded-[10px]">
                    <thead>
                            <tr className="bg-gray-100 border-b">

                            <th className="py-2 px-4 text-left text-[#53595B] ">Serial No.</th>
                            <th className="py-2 px-4 text-left text-[#53595B] ">Name</th>
                            <th className="py-2 px-4 text-left text-[#53595B] ">Email</th>
                            <th className="py-2 px-4 text-left text-[#53595B] ">Phone</th>
                            <th className="py-2 px-4 text-left text-[#53595B] ">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients && patients.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-2 px-4 text-center text-gray-500">
                                    No records found
                                </td>
                            </tr>
                        ) : patients.map((patient,index) => (
                            <tr key={patient._id} className="hover:bg-gray-50 border-b">
                                <td className="py-2 px-4"> {(page - 1) * 10 + index + 1}</td>
                                <td className="py-2 px-4 cursor-pointer " onClick={() => handleView(patient._id)}>{patient.firstName} {patient.lastName}</td>
                                <td className="py-2 px-4">{patient.email}</td>
                                <td className="py-2 px-4">{patient?.phone || "Not available"}</td>
                                <td className="py-2 px-4">
                                    <div className='flex'>
                                {/* <img
                                    src='/images/eye-open.svg'
                                            alt="Toggle visibility"
                                            title='View Detail'
                                    onClick={() => handleView(patient._id)}
                                    className="cursor-pointer w-6 "
                                /> */}
                                    <button
                                            onClick={() => handleEdit(patient._id)}
                                            title='Edit Patient'

                                        className="text-blue-600 hover:underline px-4"
                                    >
                                        <EditIcon />
                                    </button>
                                    {/* <button
                                            onClick={() => handleDelete(patient._id)}
                                            title='Delete Patient'

                                        className="text-red-600 hover:underline "
                                    >
                                        <DeleteIcon />
                                        </button> */}
                                        </div>
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
