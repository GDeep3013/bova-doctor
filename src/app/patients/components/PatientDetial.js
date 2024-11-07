// pages/patients/EditPatient.js
'use client'
import AppLayout from '../../../components/Applayout';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter,useParams } from 'next/navigation';
import Link from 'next/link'
export default function PatientDetial() {

    const router = useRouter();
    const { id } = useParams();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
       const [createdDate, setCreatedDate] = useState('');
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit',
        });
    }
    function formatPhoneNumber(phoneNumber) {
        if (!phoneNumber ) return phoneNumber; 
        return `${phoneNumber.slice(0, 5)}-${phoneNumber.slice(5)}`;
      }
    
    useEffect(() => {
        if (id) {
            const fetchPatientData = async () => {
                const response = await fetch(`/api/patients/edit/${id}`);
                const data = await response.json();
                if (response.ok) {
                    setFirstName(data.firstName);
                    setLastName(data.lastName);
                    setEmail(data.email);
                    setPhone(formatPhoneNumber(data.phone));
                    setCreatedDate(formatDate(data.createdAt));
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to fetch patient data.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                }
            };

            fetchPatientData();
        }
    }, [id]);


    return (
        <AppLayout>
            <div className="flex flex-col p-6">

                <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg">

                    <div className="bg-customBg3 p-4 rounded-t-lg w-full flex justify-between items-center"><span className="text-[19px] text-black">Patient Profile</span></div>

                    <div className="p-7 space-y-2 text-gray-700">
                        <div className="bg-[#EBEDEB] p-4 rounded-[8px] flex justify-between items-center">
                            <span className="font-medium text-base text-gray-700">
                                Patient Name: <span>{firstName +' ' + lastName}</span>
                            </span>
                            <span className="text-gray-600 text-base">Date Created: {createdDate}</span>
                        </div>
                        <p className='flex justify-between p-2'>
                            <span className="text-textColor text-base">Patient Email:</span> <span className='text-left min-w-[126px]'> {email} </span>
                        </p>
                        <p className='flex justify-between p-2'>
                            <span className="text-textColor text-base">Patient Phone Number:</span> <span className='text-left min-w-[126px]'> {phone} </span>
                        </p>
                        <p className='flex justify-between p-2'>
                            <span className="text-textColor text-base">Discount Rate:</span> <span className='text-left min-w-[126px]'> 10% </span>
                        </p>
                        <p className='flex justify-between p-2'>
                            <span className="text-textColor text-base">Current Subscriptions:</span> <span className='text-left min-w-[126px]'> L-01 </span>
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="p-4 flex justify-end">
                        <Link href="/create-plan">
                            <button className="py-2 px-4 bg-black text-white rounded-[8px] hover:bg-customText min-w-[196px] min-h-[50px]">
                                Create Plan
                            </button>
                        </Link>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
