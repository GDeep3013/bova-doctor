'use client'
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import { useState } from 'react';

export default function ForgetPassword() {

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('')  
  const router = useRouter()

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', };

    // Basic email validation
    if (!email) {
      newErrors.email = 'Please Enter Email ';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        Swal.fire({
          title: 'Sending...',
          html: 'Please wait while we send the email.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await fetch('/api/forget-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        const result = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'Success!',
            text: 'Password change link send on our email',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          router.push('/login');
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
            <h2 className="text-2xl font-bold">Forgot Password</h2>
            <p className="text-gray-600"> Please enter your email address.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 py-5 w-full max-w-screen-sm">
            <div className="relative">
              <img src="/images/email.svg" alt="Email icon" className="absolute left-3 top-3 w-4 h-4" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }} className={`w-full pl-10 pr-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              {loginError && <p className="text-red-500 text-sm mt-1">{loginError}</p>}

            </div>

            <button type="submit" className="w-full py-2 bg-black text-white font-bold rounded hover:bg-customText focus:outline-none min-h-[50px]">Send Password Reset Link</button>
            <p className='text-center'> <Link href="/login" className='text-base text-textColor hover:text-black'>← Back to  Login Page</Link> </p>

          </form>

        </div>
      </div>
    </div>
  </div>
  )
}