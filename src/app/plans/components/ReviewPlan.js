'use client';
import AppLayout from '../../../components/Applayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { DeleteIcon, EditIcon } from 'components/svg-icons/icons';
import Link from 'next/link'
import Loader from 'components/loader';

export default function ReviewPlan() {
    const { data: session } = useSession();
    const [plans, setPlans] = useState([]);
    const router = useRouter();
    const [error, setError] = useState('')
    const [fetchLoader, setFetchLoader] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    function formatPhoneNumber(phoneNumber) {
        if (!phoneNumber) return phoneNumber; // Return as is if not 10 digits

        return `${phoneNumber.slice(0, 5)}-${phoneNumber.slice(5)}`;
    }

    const handleView = (id) => {
        router.push(`/plans/plan-detail/${id}`);
    };

    const handleEdit = (id) => {
        router.push(`/plans/edit-plan/${id}`);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Once deleted, you will not be able to recover this plans!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/plans/edit/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error("Failed to delete plans");
                }
                setPlans(plans.filter(plan => plan._id !== id));
                Swal.fire(
                    'Deleted!',
                    'Your plans has been deleted.',
                    'success'
                );
            } catch (error) {
                console.log(error.message);
            }
        }
    };

    const fetchPlans = async (currentPage = 1) => {

        try {
            setFetchLoader(true)
            const response = await fetch(`/api/plans/getPlans?userId=${session?.user?.id}&page=${currentPage}&limit=${limit}`);
            if (!response.ok) {
                throw new Error("Failed to fetch patients");
            }
            const data = await response.json();
            setPlans(data.plans);
            setFetchLoader(false)
            setTotalPages(data.pagination.totalPages);

        } catch (error) {
            setError(error.message);
            setFetchLoader(false)

        }
    }
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
    useEffect(() => {
        fetchPlans(page);
    }, [session, page])

 
    return (
        <AppLayout>
            <div className="mx-auto">
                {
                    fetchLoader ? <Loader /> : <>

                        <div className='flex justify-between mt-2 mb-6'>
                            <h1 className="text-2xl">Plan List</h1>
                            <Link href='/plans/create-plan' className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-inherit min-w-[130px] text-center" >
                                Add Plan
                            </Link>
                        </div>
                        <div className='overflow-hidden overflow-x-auto max-w-full w-full'>
                            <table className="min-w-[max-content] w-full bg-white doctor-listing rounded-[10px]">
                                <thead>
                                    <tr className="bg-gray-100 border-b">
                                        <th className="py-2 px-4 text-left text-[#53595B] ">Serial No.</th>
                                        <th className="py-2 px-4 text-left text-[#53595B] ">Name</th>
                                        <th className="py-2 px-4 text-left text-[#53595B] ">Email</th>
                                        <th className="py-2 px-4 text-left text-[#53595B] ">Patient Discount</th>
                                        <th className="py-2 px-4 text-left text-[#53595B] ">Commission </th>
                                        <th className="py-2 px-4 text-left text-[#53595B] ">Status</th>
                                        <th className="py-2 px-4 text-left text-[#53595B] ">Created Date</th>
                                        <th className="py-2 px-4 text-left text-[#53595B] ">View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans && plans.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-2 px-4 text-center text-gray-500">
                                                No records found
                                            </td>
                                        </tr>
                                    ) : plans.map((plan, index) => (
                                        <tr key={plan._id} className="hover:bg-gray-50 border-b">
                                            <td className="py-2 px-4"> {(page - 1) * 10 + index + 1}</td>
                                            <td className="py-2 px-4">{plan?.patient_id?.firstName} {plan?.patient_id?.lastName}</td>
                                            <td className="py-2 px-4">{plan?.patient_id?.email}</td>
                                            <td className="py-2 px-4">{plan.discount ? plan?.discount + '%' : "Not available"}</td>
                                            <td className="py-2 px-4">{plan.order?.doctor.doctor_payment ?('$ '+ plan?.order?.doctor?.doctor_payment.toFixed(2)): "Not Available Yet"} </td>
                                            <td className="py-2 px-4">{plan.status ? (
                                                <span
                                                    className={`px-2 py-1 rounded-full text-white ${plan.status === "pending"
                                                        ? "bg-yellow-500"
                                                        : "bg-green-500"
                                                        }`}
                                                >
                                                    {plan.status}
                                                </span>
                                            ) : (
                                                "Not available"
                                            )}</td>
                                            <td className="py-2 px-4">{formatDateTime(plan?.createdAt) || "Not available"}</td>
                                            <td className="py-2 px-4">
                                                <div className='flex'>
                                                    <img
                                                        src='/images/eye-open.svg'
                                                        alt="Toggle visibility"
                                                        title='View Detail'
                                                        onClick={() => handleView(plan._id)}
                                                        className={`cursor-pointer w-6 `}
                                                    />
                                                    <button
                                                        onClick={() => handleEdit(plan._id)}
                                                        title='Edit plan'
                                                        disabled={plan.status === "ordered"}
                                                        className={`text-blue-600 hover:underline px-4 w-6 ${
                                                            plan.status === "ordered" ? "cursor-not-allowed opacity-50" : ""
                                                          }`}
                                                    >
                                                        <EditIcon />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(plan._id)}
                                                        title='Delete plan'
                                                        disabled={plan.status === "ordered"}
                                                         className={`text-blue-600 hover:underline px-4 w-6 ${
                                                            plan.status === "ordered" ? "cursor-not-allowed opacity-50" : ""
                                                          }`}
                                                    >
                                                        <DeleteIcon className="w-2 h-2" />
                                                    </button>



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
                    </>
                }
            </div>
        </AppLayout>
    );
}
