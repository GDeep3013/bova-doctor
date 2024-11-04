

import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation'
import { useAppContext } from '../context/AppContext';

export default function Forget() {
  const { session, email, setEmail, errors, setErrors, setLoginError, loginError} = useAppContext();

  const router = useRouter()
 
  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '',  };

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

        const response = await fetch('/api/forget_password', {
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
        <div className="flex flex-wrap bg-white rounded-lg shadow-lg min-h-screen">
          <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center bg-customBg">
            <div className='max-w-[524px] text-center logincircle'>
              <img src="/images/logo.png" alt="Logo" className="w-24 mb-6 m-auto" />
              <h2 className="text-xl font-bold text-center mb-2 max-w-[450px] text-customText">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</h2>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center">
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
             
              <button type="submit" className="w-full py-2 bg-customBg text-white font-bold rounded hover:bg-customText focus:outline-none">Send Password Reset Link</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
