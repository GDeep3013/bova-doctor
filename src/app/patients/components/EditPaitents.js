// pages/patients/EditPatient.js
'use client'
import AppLayout from '../../../components/Applayout';
import {useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link'
export default function EditPatient() {
    const { data: session } = useSession();
    const router = useRouter();
    const { id } = useParams();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const [errors, setErrors] = useState({});


    useEffect(() => {
        if (id) {
            const fetchPatientData = async () => {
                const response = await fetch(`/api/patients/edit/${id}`);
                const data = await response.json();

                if (response.ok) {
                    setFirstName(data.firstName);
                    setLastName(data.lastName);
                    setEmail(data.email);
                    setPhone(data.phone);

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

    const validateForm = () => {
        let valid = true;
        const newErrors = {};
        if (!firstName) {
            newErrors.firstName = 'First name is required';
            valid = false;
        }
        if (!lastName) {
            newErrors.lastName = 'Last name is required';
            valid = false;
        }
        if (!email) {
            newErrors.email = 'Email is required';
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email address is invalid';
            valid = false;
        }
        if (!phone) {
            newErrors.phone = 'Phone number is required';
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            let doctorId = session?.user?.id;
            try {
                const response = await fetch(`/api/patients/edit/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id, firstName, lastName, email, phone, doctorId }),
                });
                if (response.ok) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Patient updated successfully!',
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });
                    router.push('/patients/listing');
                } else {
                    const result = await response.json();
                    const apiErrors = result.error;

                    if (apiErrors.includes('Email already exists')) {
                        setErrors({ ...errors, email: 'Email already exists' });
                    }
                    if (apiErrors.includes('Phone number already exists')) {
                        setErrors({ ...errors, phone: 'Phone number already exists' });
                    }
                }
            } catch (error) {
                console.error('Error during patient updating:', error);
                setErrors({ apiError: 'Internal server error' });
            }
        }
    };
    return (
        <AppLayout>
        <div className="login-outer flex flex-col">
        <h1 className='page-title pt-2 text-2xl pb-1'>Edit Patient</h1>
        <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>
            <div className="container mx-auto max-w-full mt-6">
                <div className="flex flex-wrap w-full max-w-3xl bg-white rounded-lg shadow-lg">
                    <div className="bg-customBg3 p-4 rounded-t-lg w-full flex justify-between items-center"><span className="text-[19px] text-black">Edit Patient Information</span></div>
                    <form onSubmit={handleSubmit} className="space-y-2 p-8 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-42${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-2 ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>


                        <div className="message-text">
                            <p className='text-base text-textColor'>A plan sent via text message connects better than just email.</p>
                        </div>

                        <div className="text-right mt-5">
                            <button
                                type="submit"
                                className="min-w-[200px] py-2 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:bg-white hover:text-customBg2 focus:outline-none"
                            >
                                Update Patient Detail
                            </button>
                        </div>
                        {errors.apiError && <p className="text-red-500 text-sm mt-3">{errors.apiError}</p>}
                    </form>
                </div>
            </div>
        </div>
    </AppLayout>
    );
}
