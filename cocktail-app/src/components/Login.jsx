import React from 'react';
import AuthPanel from './AuthPanel';
import RegistrationForm from './RegistrationForm';
import { useAuth } from '../context/AuthContext';

export default function Login({ }) {
   const { user, } = useAuth();
    
  if (user) {
    return(
      <div className="flex-1 flex flex-col items-center md:justify-center md:items-stretch gap-8 mt-8 w-full max-w-3xl mx-auto">
        <AuthPanel />
      </div>
    );
  }
  return (
    <div className="flex flex-col md:flex-row md:justify-center md:items-stretch gap-8 mt-8 w-full max-w-3xl mx-auto">
      <div className="flex-1 flex flex-col items-center">
        <AuthPanel />
      </div>
      <div className="flex-1 flex flex-col items-center ">
        <RegistrationForm />
      </div>
    </div>
  );
}
