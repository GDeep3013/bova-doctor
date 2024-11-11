"use client"
import React, { useState } from 'react'
import { signIn } from 'next-auth/react';
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import '../../globals.css'

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    // Basic email validation
    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
      valid = false;
    }
    // Basic password validation
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });
        if (result?.error) {
          setLoginError(result.error);
        } else {
          window.location.href = '/dashboard'
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
        <div className="w-full md:max-w-[500px] xl:max-w-[600px] 2xl:max-w-[720px] max-w-[100%] bg-[rgba(255,255,255,80%)] 2xl:p-16 p-5 flex flex-col items-center justify-center md:absolute relative md:right-9 lg:right-16 2xl:right-24 z-[1] md:top-[50%] top-4 md:translate-y-[-50%] md:translate-x-[0] rounded-[20px]">
          <div className="text-center mb-4 w-full max-w-screen-sm">
            <Link href="/"> <img src='/images/logo.png' alt='logo' className='md:max-w-[166px] max-w-[150px] m-auto'/> </Link>
            <h2 className="md:text-3xl font-bold md:mt-7 mt-4 text-2xl">Sign In to your Account</h2>
            <p className="textColor md:mt-8 mt-3 max-w-[500px] m-auto text-base">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry s</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 py-5 w-full max-w-screen-sm">
            <div className="relative">
              <img src="/images/email.svg" alt="Email icon" className="absolute left-3 top-5 w-4 h-4" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }} className={`w-full pl-10 pr-4 py-2 border bg-white min-h-[56px] ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

            </div>
            <div className="relative">
              <img src="/images/lock.svg" alt="Password icon" className="absolute left-3 top-5 w-4 h-4" />
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }); }} className={`w-full pl-10 pr-4 py-2 border bg-white min-h-[56px] ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`} />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              <img src={!showPassword ? '/images/eye.svg' : '/images/eye-open.svg'} alt="Toggle visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[18px] w-5 h-5 cursor-pointer" />
              {loginError && <p className="text-red-500 text-sm mt-1">{loginError}</p>}

            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox w-5 h-5" />
                <span className='text-textColor text-base'>Remember me</span>
              </label>
              <Link href="/forget-password" className="text-base text-textColor hover:text-black">Forgot Password?</Link>
            </div>

            <button type="submit" className="w-full py-2 bg-black text-white font-bold rounded hover:bg-customText focus:outline-none min-h-[50px]">Login</button>

          </form>
        </div>
      </div>
    </div>
  </div>
  )
}
