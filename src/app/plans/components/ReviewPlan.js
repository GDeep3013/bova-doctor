'use client';
import AppLayout from '../../../components/Applayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { DeleteIcon, EditIcon } from 'components/svg-icons/icons';
import Link from 'next/link'
export default function ReviewPlan() {
    const { data: session } = useSession();
    const [plans, setPlans] = useState([]);
    const router = useRouter();
    const [error, setError] = useState('')

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
            const response = await fetch(`/api/plans/getPlans?userId=${session?.user?.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch patients");
            }
            const data = await response.json();
            console.log(data);
            setPlans(data);
        } catch (error) {
            setError(error.message);
        }
    }

   useEffect(() => {
        fetchPlans();
    }, [session]);



    return (
        <AppLayout>
            <div className="container mx-auto">
                <div className='flex justify-between mt-2 mb-6'>
                    <h1 className="text-2xl font-bold">Plan List</h1>
                    <Link href='/plans/create-plan' className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-inherit min-w-[130px] text-center" >
                        Add Plan
                    </Link>
                </div>
                <table className="min-w-full bg-white doctor-listing rounded-[10px]">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="py-2 px-4 text-left text-gray-800">Name</th>
                            <th className="py-2 px-4 text-left text-gray-800">Email</th>
                            <th className="py-2 px-4 text-left text-gray-800">Phone</th>
                            <th className="py-2 px-4 text-left text-gray-800">Status</th>
                            <th className="py-2 px-4 text-left text-gray-800">View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans && plans.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-2 px-4 text-center text-gray-500">
                                    No records found
                                </td>
                            </tr>
                        ) : plans.map((plan) => (
                            <tr key={plan._id} className="hover:bg-gray-50 border-b">
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
        </AppLayout>
    );
}
