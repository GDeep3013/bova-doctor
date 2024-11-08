'use client';
import Swal from 'sweetalert2';
import {useState ,useEffect} from 'react';
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ResetPage() {
    const router = useRouter()
;
    const [errors, setErrors] = useState({});
    const [loginError, setLoginError] = useState('')
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const[token, setToken] =useState('')
  
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

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setToken(urlParams.get("token"));
      }, []);

    console.log(token);

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

                <div className="min-h-screen h-full p-[20px] pb-[40px] md:p-0 bg-[url('/images/login-bg.jpg')] bg-no-repeat bg-cover relative login-after">
                    <div className="w-full md:max-w-[720px] max-w-[100%] bg-[rgba(255,255,255,80%)] md:p-16 p-5 flex flex-col items-center justify-center md:absolute relative md:right-6 lg:right-24 z-[1] md:top-[50%] top-4 md:translate-y-[-50%] md:translate-x-[0] rounded-[20px]">
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

                            <button type="submit" className="w-full py-2 bg-black text-white font-bold rounded hover:bg-customText focus:outline-none min-h-[50px]">Create New Password</button>
                            <p className='text-center'> <Link href="/login" className='text-base text-textColor hover:text-black'>← Back to  Login Page</Link> </p>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}