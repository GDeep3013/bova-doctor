// pages/patients/EditPatient.js

import AppLayout from '../../../components/Applayout';
import { useAppContext } from '../../../context/AppContext';
import { useEffect } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

export default function EditPatient() {
    const router = useRouter();
    const { id } = router.query;
    const { session, firstName, lastName, setFirstName, setLastName, email, setEmail, phone, setPhone, errors, setErrors, setFormSuccess, } = useAppContext();

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
                    setFormSuccess(true);
                    router.push('/patients/listing');
                } else {
                    const result = await response.json();
                    const apiErrors = result.error;

                    // if (apiErrors.includes('Email already exists')) {
                    //     setErrors({ ...errors, email: 'Email already exists' });
                    // }
                    // if (apiErrors.includes('Phone number already exists')) {
                    //     setErrors({ ...errors, phone: 'Phone number already exists' });
                    // }
                }
            } catch (error) {
                console.error('Error during patient updating:', error);
                setErrors({ apiError: 'Internal server error' });
            }
        }
    };

    return (
        <AppLayout>
            <div className="login-outer min-h bg-gray-50 flex flex-col p-6">
                <h1 className="page-title pt-2 pb-3 text-2xl font-semibold">Edit Patient</h1>
                <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>
                <div className="container mx-auto max-w-full p-0">
                    <div className="flex flex-wrap w-full max-w-3xl bg-white rounded-lg border border-[#AFAAAC] p-8">
                        <form onSubmit={handleSubmit} className="space-y-4 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className={`w-full px-4 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                    />
                                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className={`w-full px-4 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
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
                                    className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>

                            <button
                                type="submit"
                                className="min-w-[200px] py-2 bg-customBg2 text-white font-medium rounded hover:bg-customText focus:outline-none"
                            >
                                Update Patient Details
                            </button>
                            {errors.apiError && <p className="text-red-500 text-sm mt-3">{errors.apiError}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}