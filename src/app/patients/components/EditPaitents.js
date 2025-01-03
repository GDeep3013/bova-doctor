// pages/patients/EditPatient.js
'use client'
import AppLayout from '../../../components/Applayout';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Loader from 'components/loader';
export default function EditPatient() {
    const { data: session } = useSession();
    const router = useRouter();
    const { id } = useParams();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loader, setLoader] = useState(false);
    const [fetchLoader, setFetchLoader] = useState(false);
    const [errors, setErrors] = useState({});

    //fetch paitent based on Id
    useEffect(() => {
        if (id) {
            setFetchLoader(false)
            const fetchPatientData = async () => {
                const response = await fetch(`/api/patients/edit/${id}`);
                const data = await response.json();
                if (response.ok) {
                    setFirstName(data?.patient?.firstName);
                    setLastName(data?.patient?.lastName);
                    setEmail(data?.patient?.email);
                    setPhone(data?.patient?.phone);
                    setFetchLoader(false)
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to fetch patient data.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: "#3c96b5",
                    });
                }
                setFetchLoader(false)
            };
            fetchPatientData();
        }
    }, [id]);

    // validation for the edit form
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

    // handleSubmit to update the patients

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            let doctorId = session?.user?.id;
            try {
                setLoader(true)
                const response = await fetch(`/api/patients/edit/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id, firstName, lastName, email, phone, doctorId }),
                });
                if (response.ok) {
                    const result = await response.json();

                    Swal.fire({
                        title: 'Success!',
                        iconHtml: '<img src="/images/succes_icon.png" alt="Success Image" class="custom-icon" style="width: 63px; height: 63px;">',
                        text: 'Patient updated successfully!',
                        confirmButtonText: 'OK',
                        confirmButtonColor: "#3c96b5",
                    });
                    setLoader(false);
                    router.push(`/patients/detail/${result?._id}`); 
                } else {
                    const result = await response.json();
                    const apiErrors = result.error;

                    if (apiErrors.includes('Email already exists')) {
                        setErrors({ ...errors, email: 'Email already exists' });
                    }
                    if (apiErrors.includes('Phone number already exists')) {
                        setErrors({ ...errors, phone: 'Phone number already exists' });
                    }
                    setLoader(false);
                }
            } catch (error) {
                console.error('Error during patient updating:', error);
                setErrors({ apiError: 'Internal server error' });
                setLoader(false);
            }
        }
    };
    return (
        <AppLayout>
            <div className="login-outer flex flex-col">
                {fetchLoader ? <Loader /> : <>
                    <h1 className='page-title pt-2 text-2xl pb-1'>Edit Patient</h1>
                    <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>
                    <div className="container mx-auto max-w-full mt-2">
                        <div className="flex flex-wrap w-full max-w-3xl bg-white rounded-lg border border-[#AFAAAC]">
                            {/* <div className="bg-customBg3 py-4 px-4 md:px-8 rounded-t-lg w-full flex justify-between items-center"><span className="text-[19px] text-black">Edit Patient Information</span></div> */}
                            <form onSubmit={handleSubmit} className="space-y-2 p-4 md:p-8 md:pr-24  w-full">

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
                                                setLastName(e.target.value);
                                                if (errors.lastName) setErrors({ ...errors, lastName: '' });
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
                                        onChange={(e) => {
                                            setPhone(e.target.value); if (errors.phone) { setErrors((prevErrors) => ({ ...prevErrors, phone: '' })); }
                                        }}
                                        className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                    />
                                    {errors.phone && <p className="text-red-500 text-[13px] mt-0">{errors.phone}</p>}
                                </div>


                                <div className="message-text !mt-0 ">
                                    <p className='text-base text-slate-900 font-light'>A plan sent via text message connects better than just email.</p>
                                </div>

                                <div className="text-left mt-7">
                                    <button
                                        type="submit"
                                        className="min-w-[200px] py-2 mt-3 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:bg-white hover:text-customBg2 focus:outline-none"
                                    >
                                        {loader ? "Please wait..." : "Update Patient Detail"}
                                    </button>
                                </div>
                                {errors.apiError && <p className="text-red-500 text-[13px] mt-0">{errors.apiError}</p>}
                            </form>
                        </div>
                    </div>
                </>}
            </div>
        </AppLayout>
    );
}
