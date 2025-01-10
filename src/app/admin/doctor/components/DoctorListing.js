'use client'
import AppLayout from '../../../../components/Applayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CloseIcon, CopyIcon, DeleteIcon, EditIcon } from 'components/svg-icons/icons';
import Loader from 'components/loader';

export default function DoctorListing() {

    const { data: session } = useSession();
    const [doctors, setDoctors] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10); // Set the limit of doctors per page
    const router = useRouter();
    const [fetchLoader, setFetchLoader] = useState(false);
    const [isModal, setIsModal] = useState(false);
    const [resetLink, setResetLink] = useState('false');
    const [sortOrder, setSortOrder] = useState("desc");
    const [sortColumn, setSortColumn] = useState("desc");
    const [searchQuery, setSearchQuery] = useState("");

    const itemsPerPage = 30;

    // Tab state and pagination for each tab
    const [activeTab, setActiveTab] = useState("Completed");
    const [totalDoctorsComplete, setTotalDoctorsComplete] = useState('');
    const [totalDoctorsInComplete, setTotalDoctorsInComplete] = useState('');



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
                if (activeTab === "Completed") {
                    setTotalDoctorsComplete(prev => prev - 1);
                } else {
                    setTotalDoctorsInComplete(prev => prev - 1);
                }

                Swal.fire('Deleted!', 'Doctor has been deleted.', 'success');
            } catch (error) {
                console.log(error.message);
            }
        }
    };

    const handleEdit = (id) => {
        router.push(`/admin/doctor/edit/${id}`);
    };

    const toggleSortOrder = (column) => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newOrder);
        setSortColumn(column);
        setPage(1)
        fetchDoctors(1, column, newOrder, searchQuery, activeTab);
    };
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setPage(1)
        fetchDoctors(1, sortColumn, sortOrder, value, activeTab);
    };
    const fetchDoctors = async (currentPage = 1, sortColumn = "createdAt", order = "desc", searchQuery = "", activeTab = "Completed") => {
        try {
            const response = await fetch(`/api/doctors/getDoctors?userId=${session?.user?.id}&page=${currentPage}&limit=${limit}&sortColumn=${sortColumn}&sortOrder=${order}&searchQuery=${searchQuery}&signupStatus=${activeTab}`);
            if (!response.ok) {
                throw new Error("Failed to fetch doctors");
            }
            const data = await response.json();
            setDoctors(data.data);
            setTotalDoctorsComplete(data.completedCount)
            setTotalDoctorsInComplete(data.incompleteCount)
            setTotalPages(data.pagination.totalPages);
            setFetchLoader(false);
        } catch (error) {
            setFetchLoader(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPage(1)
        fetchDoctors(1, "createdAt", "desc", searchQuery, tab);
    };

    const handlePagination = (page, activeTab) => {
        setPage(page);
        fetchDoctors(page, sortColumn, sortOrder, searchQuery, activeTab);

    }

    useEffect(() => {
        if (session?.user?.id) {
            setFetchLoader(true);
            fetchDoctors();
        }
    }, [session]);


    const handleCopy = (link) => {
        setIsModal(true);
        const url = process.env.NEXT_PUBLIC_BASE_URL + '/create-password?token=' + link
        setResetLink(url)
    }


    const handleCopyLink = () => {
        navigator.clipboard.writeText(resetLink);
        setIsModal(false);
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };
    const formatTime = (isoString) => {
        const date = new Date(isoString);

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);

        // Format the date
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        // Format the time
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    };

    return (
        <AppLayout>
            <div className="mx-auto">
                {fetchLoader ? <Loader /> : <>
                    <div className='min-[575px]:flex justify-between items-start mt-4 md:mt-2 mb-4 md:mb-2'>
                        <div>
                            <h1 className="text-2xl">Doctors Listing</h1>
                            {/* <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button> */}
                        </div>
                        <div className='flex justify-end gap-2 w-full max-w-[348px] ml-auto md:m-0 md:max-w-[500px]'>
                            <input
                                type="text"
                                placeholder="Search Doctors..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="border border-gray-300  rounded-[8px] px-3 min-h-[38px]  focus:outline-none focus:border-[#25464f] w-full"
                            />
                            <Link href='/admin/doctor/create' className="py-2 px-4 min-h-[38px] bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 text-center hover:bg-inherit min-w-[130px]">
                                Add Doctor
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className='doctor-tabs'>
                        <button
                            className={`flex-1 py-3 px-3 border border-solid border-b-0 border-transparent min-w-[150px] text-center ${activeTab === "Completed"
                                ? " bg-[#d6dee5] text-[#3a3c3d]"
                                : "text-gray-500"
                                }`}
                            onClick={() => handleTabChange("Completed")}
                        >
                            Completed ({totalDoctorsComplete})
                        </button>
                        <button
                            className={`flex-1 py-3 px-3 min-w-[150px] text-center border border-solid border-b-0 border-transparent ${activeTab === "Incomplete"
                                ? " bg-[#d6dee5] text-[#3a3c3d]"
                                : "text-gray-500"
                                }`}
                            onClick={() => handleTabChange("Incomplete")}
                        >
                            Incomplete ({totalDoctorsInComplete})
                        </button>
                    </div>

                    <div className="overflow-hidden overflow-x-auto max-w-full w-full">
                        <table className="min-w-[max-content] w-full bg-white doctor-listing doctor-listing-radius rounded-[8px]">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="py-2 px-4 text-left text-[#53595B] ">Serial No.</th>
                                    <th className="py-2 px-4 text-left text-[#53595B] ">Name
                                        <button onClick={() => toggleSortOrder("firstName")}
                                            className="ml-2 text[#53595B] "
                                        >
                                            {sortColumn === "firstName" && sortOrder === "asc" ? "▲" : "▼"}
                                        </button>
                                    </th>
                                    <th className="py-2 px-4 text-left text-[#53595B] ">Email
                                        <button onClick={() => toggleSortOrder("email")}
                                            className="ml-2 text[#53595B] "
                                        >
                                            {sortColumn === "email" && sortOrder === "asc" ? "▲" : "▼"}
                                        </button>
                                    </th>
                                    <th className="py-2 px-4 text-left text-[#53595B] ">Phone
                                        <button onClick={() => toggleSortOrder("phone")}
                                            className="ml-2 text[#53595B] "
                                        >
                                            {sortColumn === "phone" && sortOrder === "asc" ? "▲" : "▼"}
                                        </button>
                                    </th>
                                    <th className="py-2 px-4 text-left text-[#53595B] ">Speciality
                                        <button onClick={() => toggleSortOrder("specialty")}
                                            className="ml-2 text[#53595B] "
                                        >
                                            {sortColumn === "specialty" && sortOrder === "asc" ? "▲" : "▼"}
                                        </button>
                                    </th>
                                    <th className="py-2 px-4 text-left text-[#53595B] ">Signup Status</th>
                                    <th className="py-2 px-4 text-left text-[#53595B] ">Commission %
                                        <button onClick={() => toggleSortOrder("commissionPercentage")}
                                            className="ml-2 text[#53595B] "
                                        >
                                            {sortColumn === "commissionPercentage" && sortOrder === "asc" ? "▲" : "▼"}
                                        </button>
                                    </th>
                                    <th className="py-2 px-4 text-left text-[#53595B] flex">Created Date
                                        <button onClick={() => toggleSortOrder("createdAt")}
                                            className="ml-2 text[#53595B] "
                                        >
                                            {sortColumn === "createdAt" && sortOrder === "asc" ? "▲" : "▼"}
                                        </button>
                                    </th>
                                    <th className="py-2 px-4 text-left text-[#53595B] ">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctors.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="py-2 px-4 text-center text-gray-500 border-r border-[#B0BAAE]"
                                        >
                                            No records found
                                        </td>
                                    </tr>
                                ) : (
                                    doctors.map((doctor, index) => (
                                        <tr key={doctor._id} className="hover:bg-gray-50">
                                            <td className="py-2 px-4">{(page - 1) * itemsPerPage + index + 1}</td>
                                            <td className="py-2 px-4">{`${doctor.firstName} ${doctor.lastName}`}</td>
                                            <td className="py-2 px-4">
                                                <span
                                                    title={doctor.email}
                                                    className="max-w-[200px] overflow-hidden whitespace-nowrap truncate inline-block"
                                                >
                                                    {doctor.email}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4">
                                                {doctor.phone || "Not available"}
                                            </td>
                                            <td className="py-2 px-4">
                                                <span className="max-w-[150px] overflow-hidden whitespace-nowrap truncate inline-block">
                                                    {doctor.specialty || "Not available"}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4">
                                                {doctor.signupStatus ? (
                                                    <span
                                                        className={`px-2 py-1 rounded-full capitalize text-white ${doctor.signupStatus === "Incomplete"
                                                            ? "bg-[#b5b8bf]"
                                                            : "bg-[#3c96b5]"
                                                            }`}
                                                    >
                                                        {doctor.signupStatus === "Incomplete"
                                                            ? doctor.signupStatus
                                                            : doctor.passwordCreatedDate ? (
                                                                <span title={formatTime(doctor.passwordCreatedDate)}>
                                                                    {formatDate(doctor.passwordCreatedDate)}
                                                                </span>
                                                            ) : (
                                                                <span title={formatTime(doctor.updatedAt)}>
                                                                    {formatDate(doctor.updatedAt)}
                                                                </span>
                                                            )}
                                                    </span>
                                                ) : (
                                                    "Not available"
                                                )}
                                                {doctor.signupStatus === "Incomplete" && (
                                                    <div
                                                        className="copy"
                                                        title="Copy reset password link"
                                                        onClick={() => handleCopy(doctor.resetToken)}
                                                    >
                                                        <CopyIcon />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2 px-4">
                                                {doctor.commissionPercentage || "Not available"}
                                            </td>
                                            <td className="py-2 px-4">{formatDateTime(doctor.createdAt)}</td>
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end items-center space-x-4 mt-6">
                        <button
                            disabled={page === 1}
                            onClick={() => handlePagination(page - 1, activeTab)}
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
                            onClick={() => handlePagination(page + 1, activeTab)}
                            className={`px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg transition duration-200 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-customBg2'
                                }`}
                        >
                            Next
                        </button>
                    </div>

                </>}
            </div>

            {
                isModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                        <div className="bg-white py-9 px-6 rounded-lg shadow-lg w-full max-w-[95%] md:max-w-[480px] relative">
                            <div className="flex justify-center items-center mt-6 mb-6">
                                <h2 className="text-xl font-bold text-center">Copy the Password Link</h2>

                                <button
                                    className="text-gray-500 hover:text-gray-700 absolute top-[21px] right-[21px]"
                                    onClick={() => { setIsModal(false); setResetLink(''); }}
                                >
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className='text-center'>
                                {/* <input
                                type="text"
                                value={resetLink}
                                readOnly
                                className="w-full p-3 border rounded-md mb-4 focus:outline-none focus:none"
                            /> */}
                                <button
                                    className="py-2 px-4 bg-[#25464F] border border-[#25464F] text-white rounded-[8px] hover:text-[#25464F] hover:bg-white min-w-half min-h-[46px] mb-6"
                                    onClick={handleCopyLink}
                                >
                                    Set Your BOVA Password
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </AppLayout >
    );
}
