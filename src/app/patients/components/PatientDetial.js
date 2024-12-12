// pages/patients/EditPatient.js
'use client'
import AppLayout from '../../../components/Applayout';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link'
import Loader from 'components/loader'
export default function PatientDetial() {

    const router = useRouter();
    const { id } = useParams();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [discount, setDiscount] = useState('');
    const [createdDate, setCreatedDate] = useState('');
    const [fetchLoader, setFetchLoader] = useState(false);
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
        });
    }
    function formatPhoneNumber(phoneNumber) {
        if (!phoneNumber) return phoneNumber;
        return `${phoneNumber.slice(0, 5)}-${phoneNumber.slice(5)}`;
    }

    useEffect(() => {
        if (id) {
            setFetchLoader(true)
            const fetchPatientData = async () => {
                const response = await fetch(`/api/patients/edit/${id}`);
                const data = await response.json();
               
                const latestPlan = data?.plans
                ?.sort((a, b) => new Date(b?.updatedAt) - new Date(a?.updatedAt))[0];
           
                if (response.ok) {
                    setFirstName(data?.patient?.firstName);
                    setLastName(data?.patient?.lastName);
                    setEmail(data?.patient?.email);
                    setPhone(data?.patient?.phone);
                    setCreatedDate(formatDate(data?.patient?.createdAt));
                    setDiscount(latestPlan?.discount)
                    setFetchLoader(false)
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to fetch patient data.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: "#3c96b5",
                    });
                    setFetchLoader(false)
                }
            };

            fetchPatientData();
        }
    }, [id]);


    return (
        <AppLayout>
            <div className="flex flex-col">
                {fetchLoader ? <Loader /> : <>
                    <h1 className='page-title pt-2 text-2xl pb-1'>Patient Profile</h1>
                    <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>

                    <div className="w-full max-w-3xl bg-white rounded-lg border border-[#AFAAAC]">

                        <div className="space-y-2 text-gray-700">
                            <div className="bg-customBg p-4 px-5 rounded-t-[8px] flex justify-between items-center">
                                <span className="font-medium text-sm md:text-base text-gray-700">
                              <span>{firstName +' ' + lastName}</span>
                                </span>
                                <span className="text-gray-600 text-sm md:text-base">Date Created: {createdDate}</span>
                            </div>
                            <div className='px-5'>
                                <p className='flex justify-between py-2'>
                                    <span className="text-textColor text-base">Patient Email:</span> <span className='text-right min-w-[126px]'> {email} </span>
                                </p>
                                <p className='flex justify-between py-2'>
                                    <span className="text-textColor text-base">Patient Phone Number:</span> <span className='text-right min-w-[126px]'> {phone} </span>
                                </p>                              
                                    <p className='flex justify-between py-2'>
                                        <span className="text-textColor text-base">Discount Rate:</span> <span className='text-right min-w-[126px]'> {discount?discount +'%':''} </span>
                                    </p> 
                                <p className='flex justify-between py-2'>
                                    <span className="text-textColor text-base">Current Subscriptions:</span> <span className='text-right min-w-[126px]'> L-01 </span>
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 flex justify-end">
                            <Link href={`/plans/create-plan/${id}`}>
                                <button className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-inherit min-w-[150px] min-h-[46px]">
                                    Create Plan
                                </button>
                            </Link>
                        </div>
                    </div>
                </>}
            </div>
        </AppLayout>
    );
}
