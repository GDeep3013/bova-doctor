"use client"
import AppLayout from '../../../../components/Applayout';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function CreateDoctor() {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [clinicName, setClinicName] = useState('');
    const [errors, setErrors] = useState({});
    const [specialty, setSpecialty] = useState('');
    const [userType, setUserType] = useState('');
    const [commissionPercentage, setCommissionPercentage] = useState('30');
    const [laoding, setLaoding] = useState(false);

    const validateForm = () => {
        let valid = true;
        const newErrors = { firstName: '', lastName: '', email: '', password: '', phone: '', specialty: "", userType: '', commissionPercentage: '' };
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
        } else if (!/^\d{3}-?\d{3}-?\d{4}$/.test(phone)) {
            newErrors.phone = 'Phone number must be valid (e.g., 123-456-7890 or 1234567890)';
            valid = false;
        }
        if (userType == '') {
            newErrors.userType = 'User type field is required';
            valid = false;
        }
        if (!specialty) {
            newErrors.specialty = 'Specialty field is required';
            valid = false;
        }
        if (!commissionPercentage) {
            newErrors.commissionPercentage = 'Commission Percentage field is required';
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Swal.fire({
            //     title: 'Sending...',
            //     html: 'Please wait while we send the email.',
            //     allowOutsideClick: false,
            //     didOpen: () => {
            //         Swal.showLoading();
            //     }
            // });
            setLaoding(true)
            const formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('specialty', specialty);
            formData.append('userType', userType);
            formData.append('commissionPercentage', commissionPercentage);
            formData.append('clinicName', clinicName ? clinicName : '');

            try {
                const response = await fetch('/api/doctors/create', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    Swal.fire({
                        title: 'Success!',
                        iconHtml: '<img src="/images/succes_icon.png" alt="Success Image" class="custom-icon" style="width: 63px; height: 63px;">',
                        text: 'Doctor added successfully!',
                        confirmButtonText: 'OK',
                        confirmButtonColor: "#3c96b5",
                    });
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setPhone('');
                    setUserType('');
                    setClinicName('');
                    setCommissionPercentage('');
                    setSpecialty('');
                    setLaoding(false)
                    router.push('/admin/doctor');
                } else {
                    const result = await response.json();
                    const errors = result.error;
                    if (errors) {

                        if (errors.includes('Email already exists')) {
                            setErrors({ ...errors, email: 'Email already exists' });
                        }
                        if (errors.includes('Phone number already exists')) {
                            setErrors({ ...errors, phone: 'Phone number already exists' });
                        }
                    }
                    setLaoding(false)

                }
            } catch (error) {
                // console.error('Error during doctor creation:', error);
                setErrors({ apiError: 'Internal server error' });
                setLaoding(false)

            }
        }
    };

    return (
        <AppLayout>
            <div className="login-outer flex flex-col ">
                <h1 className="page-title pt-2 pb-3 text-2xl">Add Doctor</h1>
                <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>
                <div className="container mx-auto max-w-full p-0">
                    <div className="w-full max-w-5xl bg-white rounded-lg border border-[#AFAAAC]">
                        {/* <div className="bg-customBg3 py-4 px-4 md:px-8 rounded-t-lg w-full flex justify-between items-center">
                            <span className="text-[19px] text-black">Add Doctor Information</span></div> */}
                        <div className='flex p-4 md:p-8'>
                            <form onSubmit={handleSubmit} className="space-y-4 w-full">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input type="text"
                                            placeholder="First Name"
                                            value={firstName ?? ""}
                                            onChange={(e) => {
                                                setFirstName(e.target.value); if (errors.firstName) setErrors({ ...errors, firstName: '' });
                                            }}
                                            className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-42border-gray-300 rounded focus:outline-none focus:border-[#25464f] ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-[#25464f]`}
                                        />
                                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                                    </div>

                                    <div className="relative">
                                        <input type="text"
                                            placeholder="Last Name"
                                            value={lastName ?? ""}
                                            onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors({ ...errors, lastName: '' }); }}
                                            className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-42border-gray-300 rounded focus:outline-none focus:border-[#25464f] ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-[#25464f]`} />
                                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email ?? ""}
                                            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                                            className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-42border-gray-300 rounded focus:outline-none focus:border-[#25464f] ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-[#25464f]`}
                                        />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>

                                    <div className="relative">
                                        <input
                                             type="text"
                                            placeholder="Phone Number"
                                            value={phone ?? ""}
                                            onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: '' }); }}
                                            className={`appearance-none  w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-42border-gray-300 rounded focus:outline-none focus:border-[#25464f] ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-[#25464f]`}
                                        />
                                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Specialty"
                                            value={specialty ?? ""}
                                            onChange={(e) => { setSpecialty(e.target.value); if (errors.specialty) setErrors({ ...errors, specialty: '' }); }}
                                            className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-42border-gray-300 rounded focus:outline-none focus:border-[#25464f] ${errors.specialty ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-[#25464f]`}
                                        />
                                        {errors.specialty && <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>}

                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="Commission Percentage"
                                            value={commissionPercentage ?? ""}
                                            title="Commission Percentage"
                                            max='100'
                                            onChange={(e) => { setCommissionPercentage(e.target.value); if (errors.commissionPercentage) setErrors({ ...errors, commissionPercentage: '' }); }}
                                            className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-42border-gray-300 rounded focus:outline-none focus:border-[#25464f] ${errors.commissionPercentage ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-[#25464f]`}
                                        />
                                        <span className="absolute right-4 top-[28px] transform -translate-y-1/2 text-gray-500">%</span>

                                        {errors.commissionPercentage && <p className="text-red-500 text-sm mt-1">{errors.commissionPercentage}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <select
                                            value={userType}
                                            onChange={(e) => { setUserType(e.target.value); if (errors.userType) setErrors({ ...errors, userType: '' }); }}
                                            className={`w-full select-arrow border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-42border-gray-300 rounded focus:outline-none focus:border-[#25464f] ${errors.userType ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-[#25464f]`}
                                        >
                                            <option value="">Select User Type</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Doctor">Doctor</option>
                                        </select>
                                        {errors.userType && <p className="text-red-500 text-sm mt-1">{errors.userType}</p>}
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Clinic Name"
                                            value={clinicName ?? ""}
                                            onChange={(e) => { setClinicName(e.target.value); }}
                                            className={`w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-3 mt-1 mb-42 border-gray-300 rounded focus:outline-none focus:border-[#25464f]  rounded focus:outline-none focus:border-[#25464f]`}
                                        />
                                    </div>
                                </div>
                                <div className="message-text"><p className="text-base text-slate-900 font-light">A plan sent via text message connects better than just email.</p></div>

                                <button
                                    type="submit"
                                    className="min-w-[150px] py-2 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:bg-white hover:text-customBg2 focus:outline-none"
                                >
                                    {laoding ? "Please Wait.." : "Add Doctor"}
                                </button>

                                {errors.apiError && <p className="text-red-500 text-sm mt-3">{errors.apiError}</p>}
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


