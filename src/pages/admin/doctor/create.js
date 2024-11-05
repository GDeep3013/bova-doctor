import AppLayout from '../../../components/Applayout';
import { useAppContext } from '../../../context/AppContext';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';
export default function CreateDoctor() {
    const { session, specialty, setSpecialty, phone, setPhone, firstName, setFirstName, lastName, setLastName, password, email, setEmail, errors, setErrors, userType, setUserType } = useAppContext();

    const router = useRouter();

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
            try {
                const response = await fetch('/api/doctors/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ firstName, lastName, email, phone, specialty, userType }),
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
                    router.push('/admin/doctor/listing');
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
            <div className="login-outer min-h bg-gray-50 flex flex-col p-6">
                <h1 className="page-title pt-2 pb-3 text-2xl font-semibold">Add Doctors</h1>
                <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>
                <div className="container mx-auto max-w-full p-0">
                    <div className="flex flex-wrap w-full max-w-3xl bg-white rounded-lg border border-[#AFAAAC] p-8">
                        <form onSubmit={handleSubmit} className="space-y-4 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <input type="text"
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => {
                                            setFirstName(e.target.value); if (errors.firstName) setErrors({ ...errors, firstName: '' });
                                        }}
                                        className={`w-full pl-2 pr-4 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                    />
                                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                                </div>

                                <div className="relative">
                                    <input type="text"
                                        placeholder="LastName"
                                        value={lastName}
                                        onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors({ ...errors, lastName: '' }); }}
                                        className={`w-full pl-2 pr-4 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`} />
                                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                                    className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Phone"
                                    value={phone}
                                    onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: '' }); }}
                                    className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>
                            <div className="relative">
                                <select
                                    value={userType}
                                    onChange={(e) => { setUserType(e.target.value); if (errors.userType) setErrors({ ...errors, userType: '' }); }}
                                    className={`w-full px-4 py-2 border ${errors.userType ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
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
                                    className={`w-full px-4 py-2 border ${errors.specialty ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {errors.specialty && <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>}
                            </div>

                            <button
                                type="submit"
                                className="min-w-[150px] py-2 bg-customBg2 text-white font-medium rounded hover:bg-customText focus:outline-none"
                            >
                                Add Doctor
                            </button>

                            {errors.apiError && <p className="text-red-500 text-sm mt-3">{errors.apiError}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


