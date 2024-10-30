
import React, { useState } from 'react'
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [firstName, setfirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const validateForm = () => {
    let valid = true;
    const newErrors = { firstName: '', lastName: '', email: '', password: '', phone: '', specialty: "" };
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

    // Basic password validation
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
      valid = false;
    }
    if (!phone) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits and numeric';
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
      try {
        const formData = {
          firstName,
          lastName,
          email,
          password,
          phone,
          specialty,
        };
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        const result = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'Success!',
            text: 'Your registration was successful!',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          setLoginError('');
          router.push('/login');
        } else {
          // Check for specific error messages from the backend
          const errors = result.error;
          if (errors.includes('Email already exists')) {
            setErrors({ ...errors, email: 'Email already exists' });
          }
          if (errors.includes('Phone number already exists')) {
            setErrors({ ...errors, phone: 'Phone number already exists' });
          }
          // else { setLoginError(result.error) };
        
        }
      } catch (error) {
        console.error('Error during login:', error);
        // setLoginError('Internal server error');
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
              <h2 className="text-2xl font-bold">Create new Account</h2>
              <p className="text-gray-600">Welcome !  Please enter your details.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 py-5 w-full max-w-screen-sm">
              <div className="relative">

                <input type="text" placeholder="First Name" value={firstName} onChange={(e) => { setfirstName(e.target.value); if (errors.firstName) setErrors({ ...errors, firstName: '' }); }} className={`w-full pl-2 pr-4 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`} />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div className="relative">

                <input type="text" placeholder="LastName" value={lastName} onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors({ ...errors, lastName: '' }); }} className={`w-full pl-2 pr-4 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`} />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}

              </div>

              <div className="relative">

                <input type="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }} className={`w-full pl-2 pr-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`} />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>


              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }); }} className={`w-full pl-2 pr-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`} />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                <img src={!showPassword ? '/images/eye.svg' : '/images/eye-open.svg'} alt="Toggle visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 w-5 h-5 cursor-pointer" />


              </div>
              <div className="relative">

                <input type="number" placeholder="Phone Number" value={phone} onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: '' }); }} className={`w-full pl-2 pr-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`} />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div className="relative">

                <input type="text" placeholder="specialty" value={specialty} onChange={(e) => { setSpecialty(e.target.value); if (errors.specialty) setErrors({ ...errors, specialty: '' }); }} className={`w-full pl-2 pr-4 py-2 border ${errors.specialty ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`} />
                {errors.specialty && <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>}
              </div>
              {loginError && <p className="text-red-500 text-sm mt-1">{loginError}</p>}
              <button type="submit" className="w-full py-2 bg-customBg text-white font-bold rounded hover:bg-customText focus:outline-none">Register</button>
              <p className='text-center'> Already have an account? <Link href="/login" className='font-bold text-customBg2'>Sign In</Link> </p>
           
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
