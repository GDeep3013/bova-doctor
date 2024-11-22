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

    const fetchPlans = async () => {

        try {
            setFetchLoader(true)
            const response = await fetch(`/api/plans/getPlans?userId=${session?.user?.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch patients");
            }
            const data = await response.json();
            setPlans(data);
            setFetchLoader(false)

        } catch (error) {
            setError(error.message);
            setFetchLoader(false)

        }
    }

    useEffect(() => {
        fetchPlans();
    }, [session]);



    return (
        <AppLayout>
            <div className="mx-auto">
                {
fetchLoader?<Loader/>:<>

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
                                <th className="py-2 px-4 text-left text-[#53595B] ">Sr no.</th>
                                <th className="py-2 px-4 text-left text-[#53595B] ">Name</th>
                                <th className="py-2 px-4 text-left text-[#53595B] ">Email</th>
                                <th className="py-2 px-4 text-left text-[#53595B] ">Phone</th>
                                <th className="py-2 px-4 text-left text-[#53595B] ">Status</th>
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
                                    <td className="py-2 px-4">{index + 1}</td>
                                    <td className="py-2 px-4">{plan?.patient_id?.firstName} {plan?.patient_id?.lastName}</td>
                                    <td className="py-2 px-4">{plan?.patient_id?.email}</td>
                                    <td className="py-2 px-4">{formatPhoneNumber(plan?.patient_id?.phone) || "Not available"}</td>
                                    <td className="py-2 px-4">{plan.status || "Not available"}</td>
                                    <td className="py-2 px-4">
                                        <div className='flex'>
                                            <img
                                                src='/images/eye-open.svg'
                                                alt="Toggle visibility"
                                                title='View Detail'
                                                onClick={() => handleView(plan._id)}
                                                className="cursor-pointer w-6 "
                                            />
                                            <button
                                                onClick={() => handleEdit(plan._id)}
                                                title='Edit plan'

                                                className="text-blue-600 hover:underline px-4"
                                            >
                                                <EditIcon />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(plan._id)}
                                                title='Delete plan'
                                                className="text-red-600 hover:underline "
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                        </div>
                        </>
                }
            </div>
        </AppLayout>
    );
}
