"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Swal from 'sweetalert2';
const DoctorConfirmation = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const token = searchParams.get('token');
      if (token) {
        const confirmUser = async () => {
          try {
            const res = await fetch(`/api/doctors/doctor-confirmation?token=${token}`);
            const data = await res.json();

            if (data.success) {
              const result = await signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password,
                dummyPassword: data.password
              });

              if (!result?.error) {
                window.location.href = '/dashboard';
              } else {
                setError('Login failed, please try again.');
                // console.error('Login failed:', result.error);
              }
            } else {
              setError(data.error || 'Confirmation failed.');
              // console.error('User confirmation failed:', data.error);
            }
          } catch (error) {
            setError('An error occurred while confirming the user.');
            // console.error('Error confirming user:', error);
          } finally {
            setIsLoading(false);
          }
        };
        confirmUser();
      } else {
        setError('No token found in the URL');
        setIsLoading(false);
        console.error('No token found in the URL');
      }
    }
  }, [isMounted, searchParams]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
        confirmButtonText: "Go to Login",
        confirmButtonColor: "#3c96b5",
      }).then(() => {
        window.location.href = "/login";
      });
    }
  }, [error]);

  if (isLoading) {
    return <div className="loader">
      <img src="/images/logo.png" alt="BOVA Logo" />
    </div>;
  }
  // if (error) {
  //   return <div>Error: {error}</div>;
  // }
  return null;
};

export default DoctorConfirmation;
