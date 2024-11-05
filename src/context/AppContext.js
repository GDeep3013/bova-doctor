// src/context/AppContext.js
import { createContext, useContext, useState } from 'react';
import { useSession } from 'next-auth/react';

const AppContext = createContext();

export function AppProvider({ children }) {
    
    const { data: session } = useSession();
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Toggle sidebar visibility
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState({});
    const [formSuccess, setFormSuccess] = useState(false);
    const [loginError, setLoginError] = useState('') 
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [token, setToken] = useState(null);
    const [specialty, setSpecialty] = useState('');
    const [userType, setUserType] = useState('');


    // Shared state values
    const value = {
        session,
        selectedPatient,
        setSelectedPatient,
        isSidebarOpen,
        toggleSidebar,
        firstName,
        lastName,
        setFirstName,
        setLastName,
        email,
        setEmail,
        phone,
        setPhone,
        errors,
        setErrors,
        formSuccess,
        setFormSuccess,
        setLoginError,
        loginError,
        password,
        confirmPassword,
        showPassword,
        setPassword,
        setConfirmPassword,
        setShowPassword,
        token,
        setToken,
        specialty,
        setSpecialty,
        userType,
        setUserType

    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useAppContext() {
    return useContext(AppContext);
}
