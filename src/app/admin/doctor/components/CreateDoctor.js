"use client"
import AppLayout from '../../../../components/Applayout';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
export default function CreateDoctor() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [specialty, setSpecialty] = useState('');
    const [userType, setUserType] = useState('');
    const router = useRouter();
    const [profileImage, setProfileImage] = useState(null);

    const validateForm = () => {
        let valid = true;
        const newErrors = { firstName: '', lastName: '', email: '', password: '', phone: '', specialty: "", userType: '' };
        if (!firstName) {
            newErrors.firstName = 'First name is required';
            valid = false;
        }
        if (!lastName) {
            newErrors.lastName = 'Last name is required';
            valid = false;
        }
        // Basic email validation
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
        } else if (!/^\d{10}$/.test(phone)) {
            newErrors.phone = 'Phone number must be exactly 10 digits and numeric';
            valid = false;
        }
        if (userType == '') {
            newErrors.userType = 'User type field is required';
            valid = false;
        }

        if (!specialty) {
            newErrors.specialty = 'specialty field is required';
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    const handleImageChange = (e) => {
        setProfileImage(e.target.files[0]);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            Swal.fire({
                title: 'Sending...',
                html: 'Please wait while we send the email.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            const formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('specialty', specialty);
            formData.append('message', message);
            formData.append('userType', userType);
            if (profileImage) {
                formData.append('profileImage', profileImage); // add the image file
            }

            try {
                const response = await fetch('/api/doctors/create', {
                    method: 'POST',
                    body: formData, // send FormData object
                });

                if (response.ok) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Doctor added successfully!',
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setPhone('');
                    setUserType('');
                    setSpecialty('');
                    setProfileImage(null);
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
                }
            } catch (error) {
                console.error('Error during doctor creation:', error);
                setErrors({ apiError: 'Internal server error' });
            }
        }
    };

    return (
        <AppLayout>
            <div className="login-outer flex flex-col ">
                <h1 className="page-title pt-2 pb-3 text-2xl font-semibold">Add Doctors</h1>
                <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>
                <div className="container mx-auto max-w-full p-0">
                    <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg">
                        <div className="bg-customBg3 p-4 rounded-t-lg w-full flex justify-between items-center"><span className="text-[19px] text-black">Add Doctor Information</span></div>
                        <div className='flex p-8'>
                            <form onSubmit={handleSubmit} className="space-y-4 w-full pr-16">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input type="text"
                                            placeholder="First Name"
                                            value={firstName}
                                            onChange={(e) => {
                                                setFirstName(e.target.value); if (errors.firstName) setErrors({ ...errors, firstName: '' });
                                            }}
                                            className={`w-full bg-inputBg min-h-[50px] rounded-[8px] p-3 mt-1 mb-42border-gray-300 rounded focus:outline-none focus:border-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                        />
                                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                                    </div>

                                    <div className="relative">
                                        <input type="text"
                                            placeholder="LastName"
                                            value={lastName}
                                            onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors({ ...errors, lastName: '' }); }}
                                            className={`w-full bg-inputBg min-h-[50px] rounded-[8px] p-3 mt-1 mb-42border-gray-300 rounded focus:outline-none focus:border-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`} />
                                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                                            className={`w-full bg-inputBg min-h-[50px] rounded-[8px] p-3 mt-1 mb-42border-gray-300 rounded focus:outline-none focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                        />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Phone"
                                            value={phone}
                                            onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: '' }); }}
                                            className={`w-full bg-inputBg min-h-[50px] rounded-[8px] p-3 mt-1 mb-42border-gray-300 rounded focus:outline-none focus:border-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                        />
                                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                    </div>
                                </div>
                                <div className="relative">
                                    <select
                                        value={userType}
                                        onChange={(e) => { setUserType(e.target.value); if (errors.userType) setErrors({ ...errors, userType: '' }); }}
                                        className={`w-full bg-inputBg min-h-[50px] rounded-[8px] p-3 mt-1 mb-42border-gray-300 rounded focus:outline-none focus:border-blue-500 ${errors.userType ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
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
                                        placeholder="Specialty"
                                        value={specialty}
                                        onChange={(e) => { setSpecialty(e.target.value); if (errors.specialty) setErrors({ ...errors, specialty: '' }); }}
                                        className={`w-full bg-inputBg min-h-[50px] rounded-[8px] p-3 mt-1 mb-42border-gray-300 rounded focus:outline-none focus:border-blue-500 ${errors.specialty ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                    />
                                    {errors.specialty && <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>}
                                </div>

                                <div className="relative"><textarea className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-4 mt-1 resize-none outline-none" value={message} onChange={(e) => { setMessage(e.target.value) }} rows="4" placeholder="Message"></textarea></div>

                                <div className="message-text"><p className="text-base text-textColor">A plan sent via text message connects better than just email.</p></div>

                                <button
                                    type="submit"
                                    className="min-w-[150px] py-2 bg-black text-white rounded-[8px] hover:bg-customText focus:outline-none"
                                >
                                    Add Doctor
                                </button>

                                {errors.apiError && <p className="text-red-500 text-sm mt-3">{errors.apiError}</p>}
                            </form>
                            <div className="doctor-profile w-full max-w-[270px] text-center">
                                <div className="relative text-center">
                                    <div className="m-auto rounded-full overflow-hidden border-[12px]  border-[#CDD3CC]">
                                        {profileImage ? <img
                                            src={URL.createObjectURL(profileImage)}
                                            alt="Profile Preview"
                                            className="w-full h-full object-cover mx-auto"
                                        /> : <img src="/images/doctor-profile.jpg" alt="Uploaded profile" className="w-60 h-60 object-cover" />}
                                    </div>
                                </div>

                                <div className="mt-4 flex space-x-2 justify-center">
                                    <label className="text-blue-500 cursor-pointer hover:underline">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                        Upload Image
                                    </label>
                                    <span className="text-gray-400">|</span>
                                    <button
                                        className="text-red-500 hover:underline"
                                        onClick={() => setProfileImage(null)}
                                    >
                                        Delete
                                    </button>
                                </div>

                                <p className="text-center text-gray-500 mt-2">
                                    An Image of the person it is best if it has the same length and height
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

