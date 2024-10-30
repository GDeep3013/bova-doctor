import LoginForm from '../components/LoginForm';
import {getSession  } from 'next-auth/react';


export default function LoginPage() {
  return (

      <LoginForm />
  );
}

