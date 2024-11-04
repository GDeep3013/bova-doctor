// pages/patients/EditPatient.js

import AppLayout from '../../../components/Applayout';
import { UserIcon } from '../../../components/svg-icons/icons';
import { useAppContext } from '../../../context/AppContext';
import { useEffect } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

export default function EditPatient() {
    const {
        session,
        firstName,
        lastName,
        setFirstName,
        setLastName,
        email,
        setEmail,
        phone,
        setPhone,
        errors,
        setErrors,
        formSuccess,
        setFormSuccess,
    } = useAppContext();

    const router = useRouter();
    const { id } = router.query; // Get patient ID from query

    useEffect(() => {
        // Fetch patient data by ID
        if (id) {
            const fetchPatientData = async () => {
                const response = await fetch(`/api/patients/${id}`);
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
    }, [id, setFirstName, setLastName, setEmail, setPhone]);

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
                const response = await fetch(`/api/patients/update`, {
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
                    // Optionally redirect or clear fields
                    router.push('/patients'); // Redirect after successful edit
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
            <div className="login-outer">
                <div className="container mx-auto max-w-full p-0">
                    <div className="flex flex-wrap bg-white rounded-lg shadow-lg min-h-screen">
                        <form onSubmit={handleSubmit} className="space-y-4 py-5 w-full max-w-screen-sm">
                            <div className="relative">
                                <UserIcon />
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                            </div>

                            <div className="relative">
                                <UserIcon />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                            </div>

                            <div className="relative">
                                <img src="/images/email.svg" alt="Email icon" className="absolute left-3 top-3 w-4 h-4" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 bg-customBg2 text-white font-bold rounded hover:bg-customText focus:outline-none"
                            >
                                Update Patient
                            </button>
                            {errors.apiError && <p className="text-red-500 text-sm mt-3">{errors.apiError}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
