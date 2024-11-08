'use client'
import AppLayout from '../../../components/Applayout';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link'
export default function Create() {
    const { data: session } = useSession();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const router = useRouter();
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
            let doctorId = session?.user?.id
            try {
                const response = await fetch('/api/patients/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ firstName, lastName, email, phone, doctorId ,message}),
                });

                if (response.ok) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Patient added successfully!',
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setPhone('');
                    setMessage('');
                    router.push('/patients/listing');
                } else {
                    const result = await response.json();
                    const errors = result.error;
                    if (errors.includes('Email already exists')) {
                        setErrors({ ...errors, email: 'Email already exists' });
                    }
                    if (errors.includes('Phone number already exists')) {
                        setErrors({ ...errors, phone: 'Phone number already exists' });
                    }
                }
            } catch (error) {
                console.error('Error during patient creation:', error);
                setErrors({ apiError: 'Internal server error' });
            }
        }
    };
    const breadcrumbItems = [
        { label: 'Plans', href: '/create-plan' },        
        { label: 'Add Patient ', href: '/add-patient-info', active: true },
    ];
    return (
        <AppLayout>
            <div className="login-outer flex flex-col">
                <nav aria-label="Breadcrumb" className="text-gray-600 text-sm">
                    <ol className="flex space-x-2">
                        {breadcrumbItems.map((item, index) => (
                            <li key={index} className="flex items-center">
                                {index > 0 && <span className="mx-2 text-xl"> ›› </span>}
                                {item.active ? (
                                    <span className="font-medium text-black text-xl">{item.label}</span>
                                ) : (
                                    <Link href={item.href} className="text-[#757575] text-xl hover:underline">
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
                {/* <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button> */}
                <div className="container mx-auto max-w-full mt-6">
                    <div className="flex flex-wrap w-full max-w-3xl bg-white rounded-lg shadow-lg">
                        <div className="bg-customBg3 p-4 rounded-t-lg w-full flex justify-between items-center"><span className="text-[19px] text-black">Add Patient Information</span></div>
                        <form onSubmit={handleSubmit} className="space-y-2 p-8 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className={`w-full bg-inputBg min-h-[50px] rounded-[8px] p-3 mt-1 mb-42${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                    />
                                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className={`w-full bg-inputBg min-h-[50px] rounded-[8px] p-3 mt-1 mb-2 ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
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
                                    className={`w-full bg-inputBg min-h-[50px] rounded-[8px] p-3 mt-1 mb-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={`w-full bg-inputBg min-h-[50px] rounded-[8px] p-3 mt-1 mb-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>

                            <div className="relative">
                                <textarea className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-4 mt-1 mb-4 resize-none outline-none" value={message}  onChange={(e) => setMessage(e.target.value)} rows="4" placeholder="Message"></textarea>
                            </div>

                            <div className="message-text">
                                <p className='text-base text-textColor'>A plan sent via text message connects better than just email.</p>
                            </div>

                            <div className="text-right mt-5">
                                <button
                                    type="submit"
                                    className="min-w-[150px] py-2 bg-black text-white rounded-[8px] hover:bg-customText focus:outline-none"
                                >
                                    Create Patient
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

