'use client';
import AppLayout from '../../../../components/Applayout';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import Loader from 'components/loader';
export default function PatientList() {
    const { data: session } = useSession();
    const [fetchLoader, setFetchLoader] = useState(false);

    const router = useRouter();
    const [patients, setPatients] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState(null);
    const itemsPerPage = 10; // Adjust this value to set the number of patients per page

    function formatPhoneNumber(phoneNumber) {
        if (!phoneNumber) return phoneNumber;
        return `${phoneNumber.slice(0, 5)}-${phoneNumber.slice(5)}`;
    }

    const fetchPatients = async (page) => {
        try {
            setFetchLoader(true)
            const response = await fetch(`/api/admin/getPatients?page=${page}&limit=${itemsPerPage}`);
            if (!response.ok) {
                throw new Error("Failed to fetch patients");
            }
            const data = await response.json();
            setPatients(data.data);
            setTotalPages(data.pagination.totalPages);
            setFetchLoader(false)
        } catch (error) {
            setError(error.message);
            setFetchLoader(false)
        }
    }
    const handleView = (id) => {
        router.push(`/admin/patients/detail/${id}`);
    };

    useEffect(() => {
        fetchPatients(currentPage);
    }, [session, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const breadcrumbItems = [
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Patient Listing', href: '/admin/patients', active: true },
    ];
    return (
        <AppLayout>
            <div className="container mx-auto ">
            {fetchLoader?<Loader/>:<>
                <h1 className="text-2xl mt-4 md:mt-2 mb-1">Patient Listing</h1>
                <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>

                <div className='overflow-hidden overflow-x-auto max-w-full w-full'>
                    <table className="min-w-[max-content] w-full bg-white doctor-listing rounded-[10px]">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-2 px-4 text-left text-[#53595B] ">Sr no.</th>

                                <th className="py-2 px-4 text-left text-[#53595B] ">Name</th>
                                <th className="py-2 px-4 text-left text-[#53595B] ">Email</th>
                                <th className="py-2 px-4 text-left text-[#53595B] ">Phone</th>
                                <th className="py-2 px-4 text-left text-[#53595B] ">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-2 px-4 text-center text-gray-500">
                                        No records found
                                    </td>
                                </tr>
                            ) : patients.map((patient,index) => (
                                <tr key={patient._id} className="hover:bg-gray-50 ">
                                    <td className="py-2 px-4">{index+1}</td>
                                    <td className="py-2 px-4">{patient.firstName} {patient.lastName}</td>
                                    <td className="py-2 px-4">{patient.email}</td>
                                    <td className="py-2 px-4">{patient.phone ? formatPhoneNumber(patient.phone) : "Not available"}</td>
                                    <td className="py-2 px-4 ">
                                        <img
                                            src='/images/eye-open.svg'
                                            alt="Toggle visibility"
                                            onClick={() => handleView(patient._id)}
                                            className="cursor-pointer"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-end items-center space-x-4 mt-6">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 text-white bg-gray-500  rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-customBg2'}`}
                    >
                        Previous
                    </button>
                    <span className="text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 text-white bg-gray-500 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-customBg2'}`}
                    >
                        Next
                    </button>
                    </div>
                    </>}
            </div>
        </AppLayout>
    );
}
