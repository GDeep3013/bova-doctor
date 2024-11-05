"use client"
import React, { useState } from 'react'
import { signIn } from 'next-auth/react';
import Link from 'next/link'
import { useRouter } from 'next/router';
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
          router.push('/dashboard');
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
              <h2 className="text-2xl font-bold">Sign In to your Account</h2>
              <p className="text-gray-600">Welcome back! Please enter your details.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 py-5 w-full max-w-screen-sm">
              <div className="relative">
                <img src="/images/email.svg" alt="Email icon" className="absolute left-3 top-3 w-4 h-4" />
                <input type="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }} className={`w-full pl-10 pr-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`} />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

              </div>
              <div className="relative">
                <img src="/images/lock.svg" alt="Password icon" className="absolute left-3 top-3 w-4 h-4" />
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }); }} className={`w-full pl-10 pr-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`} />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                <img src={!showPassword ? '/images/eye.svg' : '/images/eye-open.svg'} alt="Toggle visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 w-5 h-5 cursor-pointer" />
                {loginError && <p className="text-red-500 text-sm mt-1">{loginError}</p>}

              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox" />
                  <span>Remember me</span>
                </label>
                <Link href="/forget-password" className="font-medium text-customBg2">Forgot Password?</Link>
              </div>

              <button type="submit" className="w-full py-2 bg-customBg text-white font-bold rounded hover:bg-customText focus:outline-none">Sign In</button>
              {/* <p className='text-center'> Don&apos;t have an account? <Link href="/register" className='font-bold text-customBg2'>Create Account</Link> </p> */}

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
