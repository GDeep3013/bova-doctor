import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2';

export default function ResetPage() {
    const router = useRouter()
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({ confirmPassword: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('')

    const validateForm = () => {
        const newErrors = { confirmPassword: '', password: '' };
        let isValid = true;
        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
            isValid = false;
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };
    const [token, setToken] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const fetchedToken = urlParams.get('token');
        setToken(fetchedToken);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {

                const response = await fetch('/api/reset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token, newPassword: password }),
                });
                const result = await response.json();
                console.log('Response from API:', result);
                if (response.ok) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Password changed successfully',
                        icon: 'success',
                        confirmButtonText: 'OK',
                      });
                   router.push('/login');
                    setLoginError('');
                } else {
                    setLoginError(result.error);
                }
            } catch (error) {
                console.error('Error during login:', error);
                setLoginError('Internal server error');
            }
        }
    };

    return (
        <div className='login-outer'>
            <div className="container mx-auto max-w-full p-0">
                <div className="flex flex-wrap bg-white rounded-lg shadow-lg min-h-screen">
                    <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center bg-customBg">
                        <div className='max-w-[524px] text-center logincircle'>
                            <img src="/images/logo.png" alt="Logo" className="w-24 mb-6 m-auto" />
                            <h2 className="text-xl font-bold text-center mb-2 max-w-[450px] text-customText">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</h2>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center">
                        <div className="text-center mb-6 w-full max-w-screen-sm">
                            <h2 className="text-2xl font-bold">Reset your Password</h2>
                            <p className="text-gray-600"> Please enter your new passsword</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 py-5 w-full max-w-screen-sm">
                            <div className="relative">
                                <img src="/images/lock.svg" alt="Password icon" className="absolute left-3 top-3 w-4 h-4" />
                                {/* <input type="password" placeholder="Password" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" /> */}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors({ ...errors, password: '' });
                                    }}
                                    className={`w-full pl-10 pr-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                <img
                                    src={!showPassword ? '/images/eye.svg' : '/images/eye-open.svg'}
                                    alt="Toggle visibility"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 w-5 h-5 cursor-pointer"
                                />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}

                            </div>
                            <div className="relative">
                                <img src="/images/lock.svg" alt="Password icon" className="absolute left-3 top-3 w-4 h-4" />
                                {/* <input type="password" placeholder="Password" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" /> */}

                                <input
                                    type={"password"}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                                    }}
                                    className={`w-full pl-10 pr-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
                                />
                                {/* <img src="/images/eye.svg" alt="Toggle visibility" className="absolute right-3 top-3 w-5 h-5 cursor-pointer" /> */}
                                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                {/* <img src={showPassword ? '/images/eye.svg' : '/images/eye-open.svg'} alt="Toggle visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 w-5 h-5 cursor-pointer" /> */}
                            </div>
                            {loginError && <p className="text-red-500 text-sm mt-1">{loginError}</p>}

                            <button type="submit" className="w-full py-2 bg-customBg text-white font-bold rounded hover:bg-customText focus:outline-none">Create New Password</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
