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
            <div className="dashboard-outer flex">
                <div className='dashboard-right w-full'>
                    <div className="min-h bg-gray-50 flex flex-col p-6">
                        <h1 className="page-title pt-2 pb-3 text-2xl font-semibold">Patient Profile</h1>
                        <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back(); } } >&lt; Back</button>

                        <div className="w-full max-w-3xl bg-white rounded-lg border border-[#AFAAAC]">
                            {/* Header */}
                            <div className="bg-gray-200 p-4 rounded-t-lg flex justify-between items-center">
                                <span className="font-medium text-gray-700">
                                    Patient Name: <span className="font-bold">{firstName +' ' + lastName}</span>
                                </span>
                                <span className="text-gray-600 text-sm">Date Created: {createdDate}</span>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-2 text-gray-700">
                                <p>
                                    <span className="font-medium">Patient Email:</span> {email}
                                </p>
                                <p>
                                    <span className="font-medium">Patient Phone Number:</span> {phone}
                                </p>
                                <p>
                                    <span className="font-medium">Discount Rate:</span> 10%
                                </p>
                                <p>
                                    <span className="font-medium">Current Subscriptions:</span> L-01
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-300 flex justify-end">
                                <Link href="/create-plan">
                                    <button className="py-2 px-4 bg-customBg2 text-white rounded hover:bg-customText">
                                        Create Plan
                                    </button>
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
