'use client'
import AppLayout from '../../../components/Applayout';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function Create() {
    const { data: session } = useSession();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loader, setLoader] = useState(false);

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
        if (phone) {
            if (!/^\d{10}$/.test(phone)) {
                newErrors.phone = 'Phone number must be 10 digits';
                valid = false;
            }
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            let doctorId = session?.user?.id
            try {
                setLoader(true)
                const response = await fetch('/api/patients/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ firstName, lastName, email, phone, doctorId }),
                });

                if (response.ok) {
                    const data = await response.json(); // Parse the JSON response
                    const newPatient = data.patient;

                    Swal.fire({
                        title: 'Success!',
                        text: 'Patient added successfully!',                        
                        iconHtml: '<img src="/images/succes_icon.png" alt="Success Image" class="custom-icon" style="width: 63px; height: 63px;">',
                        confirmButtonText: 'OK',
                        confirmButtonColor: "#3c96b5",
                    });
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setPhone('');
                    setLoader(false)

                    router.push(`/patients/detail/${newPatient?._id}`);
                } else {
                    const result = await response.json();
                    const errors = result.error;
                    if (errors.includes('Email already exists')) {
                        setErrors({ ...errors, email: 'Email already exists' });
                    }
                    if (errors.includes('Phone number already exists')) {
                        setErrors({ ...errors, phone: 'Phone number already exists' });
                    }
                    setLoader(false)

                }
            } catch (error) {
                console.error('Error during patient creation:', error);
                setErrors({ apiError: 'Internal server error' });
                setLoader(false)

            }
        }
    };
    return (
        <AppLayout>
            <div className="login-outer flex flex-col">
                <h1 className='page-title pt-2 text-2xl pb-1'>Create Patient</h1>
                <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>
                <div className="container mx-auto max-w-full mt-6">
                    <div className="flex flex-wrap w-full max-w-3xl bg-white rounded-lg border border-[#AFAAAC]">
                    {/* <div className="bg-customBg3 py-4 px-4 md:px-8 rounded-t-lg w-full flex justify-between items-center"><span className="text-[19px] text-black">Create Patient</span></div> */}
                        <form onSubmit={handleSubmit} className="space-y-2 p-4 md:p-8 md:pr-24   w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        value={firstName}

                                        onChange={(e) => {
                                            setFirstName(e.target.value); if (errors.firstName) setErrors({ ...errors, firstName: '' });
                                        }}

                                        className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-2 ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                    />
                                    {errors.firstName && <p className="text-red-500 text-[13px] mt-0">{errors.firstName}</p>}
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) => {
                                            setLastName(e.target.value); if (errors.lastName) setErrors({ ...errors, lastName: '' });
                                        }}
                                        className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-2 ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                    />
                                    {errors.lastName && <p className="text-red-500 text-[13px] mt-0">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' });
                                    }}
                                    className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.email && <p className="text-red-500 text-[13px] mt-0">{errors.email}</p>}
                            </div>

                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Phone Number (optional)"
                                    value={phone}
                                    onChange={(e) => {setPhone(e.target.value); if (errors.phone) { setErrors((prevErrors) => ({ ...prevErrors, phone: '' })); }
                                    }}
                                    className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-2 rounded focus:outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'}  focus:border-blue-500`}
                                />
                                {errors.phone && <p className="text-red-500 text-[13px] mt-0">{errors.phone}</p>}
                            </div>

                            <div className="message-text !mt-0">
                                <p className='text-base text-slate-900 font-light'>A plan sent via text message connects better than just email.</p>
                            </div>

                            <div className="text-left mt-7">
                                <button
                                    type="submit"
                                    className="min-w-[150px] py-2 mt-3 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:bg-white hover:text-customBg2 focus:outline-none"
                                >
                                    {loader ? "Please wait..." : "Create Patient"}
                                </button>
                            </div>
                            {errors.apiError && <p className="text-red-500 text-[13px]  mt-0">{errors.apiError}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


