"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Use this instead of useRouter()
import { signIn } from 'next-auth/react'; // Assuming you're using NextAuth for authentication

const DoctorConfirmation = () => {
  const [isMounted, setIsMounted] = useState(false); // To track client-side mount
  const [isLoading, setIsLoading] = useState(true); // For showing loading state
  const [error, setError] = useState(null); // For capturing any errors
  const searchParams = useSearchParams(); // Get the search params directly

  useEffect(() => {
    setIsMounted(true); // Mark as mounted after the component is rendered on the client
  }, []);

  useEffect(() => {
    if (isMounted) {
      const token = searchParams.get('token'); // Extract token from the URL search params

      if (token) {
        const confirmUser = async () => {
          try {
            // Call your API to confirm the user by token
            const res = await fetch(`/api/doctors/doctor-confirmation?token=${token}`);
            const data = await res.json();

            if (data.success) {
              // After confirmation, attempt to log the user in using the credentials
              const result = await signIn('credentials', {
                redirect: false, // Avoid automatic redirect after login
                email: data.email, // Assuming the email is available in the response
                password: data.password, // The dummy password you set for the user
              });

              if (!result?.error) {
                // On success, redirect to the dashboard or desired page
                window.location.href = '/dashboard'; // or any page you want after successful login
              } else {
                setError('Login failed, please try again.');
                console.error('Login failed:', result.error);
              }
            } else {
              setError(data.error || 'Confirmation failed.');
              console.error('User confirmation failed:', data.error);
            }
          } catch (error) {
            setError('An error occurred while confirming the user.');
            console.error('Error confirming user:', error);
          } finally {
            setIsLoading(false); // Hide loading spinner
          }
        };

        confirmUser();
      } else {
        setError('No token found in the URL');
        setIsLoading(false); // Hide loading spinner
        console.error('No token found in the URL');
      }
    }
  }, [isMounted, searchParams]); // Trigger when component is mounted and searchParams are available

  if (isLoading) {
    return <div>Confirming user...</div>; // Loading message while waiting for API response
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message if any
  }

  return null; // If everything is successful, no UI needed as it's handled via redirect
};

export default DoctorConfirmation;
