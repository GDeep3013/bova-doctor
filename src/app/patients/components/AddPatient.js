
'use client';
import { useSession, update, signIn } from 'next-auth/react';
import Link from 'next/link';
import React from 'react'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from 'components/svg-icons/icons';
import Swal from 'sweetalert2';

export default function Home() {
    const { data: session } = useSession();

    const [patients, setPatients] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null); // State to track selected patient
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState(session?.password);
    const [newPassword, setNewPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('');
    const [updateLoader, setUpdateLoader] = useState(false)
    const handleRedirect = (id) => {
        if (id) {
            router.push(`/patients/edit/${id}`); // Redirect to the patient's page with ID
        } else {
            alert("Please select a patient."); // Prompt if no patient is selected
        }
    };



    const fetchPatients = async () => {
        try {
            const response = await fetch(`/api/doctors/dashboard/latestPatients?doctorId=${session?.user?.id}`);
            const result = await response.json();
            if (result.success) {
                setPatients(result.data);
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
        }
    };

    const fetchTemplate = async (type = 'old') => {
        try {
            const response = await fetch(`/api/doctors/dashboard/template?doctorId=${session?.user?.id}&type=${type}`);

            const result = await response.json();

            if (result.success) {
                const placeholders = [
                    "[Doctor's Name]",
                    "[Doctor's Email]",
                    "[Doctor's Phone]",
                    "[Doctor's Specialty]",
                    "[Doctor's Clinic]",
                    "[Doctor's Commission]"
                ];

                const replacements = [
                    session?.user?.userName,
                    session?.userDetail?.email,
                    session?.userDetail?.phone,
                    session?.userDetail?.specialty,
                    session?.userDetail?.clinicName,
                    session?.userDetail?.commissionPercentage

                ];

                const replacePlaceholders = (text, placeholders, replacements) => {
                    return placeholders.reduce((updatedText, placeholder, index) => {
                        const replacement = replacements[index] || ""; // Use empty string if replacement is undefined
                        return updatedText.replaceAll(placeholder, replacement);
                    }, text);
                };

                const updatedTitle = replacePlaceholders(result?.data?.title, placeholders, replacements);
                const updatedDescription = replacePlaceholders(result?.data?.description, placeholders, replacements);

                setTitle(updatedTitle);
                setDescription(updatedDescription);
            }

        } catch (error) {
            console.error("Error fetching patients:", error);
        }
    };
    useEffect(() => {
        if (currentPassword) {
            fetchTemplate('new');
        }
        else { fetchTemplate('old') }
        fetchPatients();

    }, []);


    const handleUpdatePassword = async () => {
        // Validate the password

        if (newPassword.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
            return;
        }
        setErrorMessage(''); // Clear any previous error message
        setUpdateLoader(true)

        try {
            const response = await fetch('/api/doctors/updatePassword', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: session?.user?.id, password: newPassword }), // Replace with other fields like ID if required
            });

            if (response.ok) {
                const data = await response.json();
                Swal.fire({
                    title: 'Success!',
                    iconHtml: '<img src="/images/succes_icon.png" alt="Success Image" class="custom-icon" style="width: 63px; height: 63px;">',
                    text: `Password update successfully`,
                    confirmButtonText: 'OK',
                    confirmButtonColor: "#3c96b5",
                });
                setCurrentPassword('')
                setNewPassword('')
                fetchTemplate('old')

                await signIn('credentials', {
                    redirect: false,
                    email: session?.user?.email,
                    password: newPassword
                });
                setUpdateLoader(false)


            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
                setUpdateLoader(false)

            }
        } catch (error) {
            alert('An error occurred while updating the password.');
            console.error(error);
            setUpdateLoader(false)
        }
    };

    return (
        <>
            <div className="w-full max-w-5xl bg-[#d6dee5] p-[20px] md:pb-16 md:p-12 mt-6 rounded-lg">
                <p className='text-lg text-[#323232]'>{title ? title : "Title is not available"}</p>
                <p className='my-4 text-lg font-normal text-[#323232] html-content' dangerouslySetInnerHTML={{ __html: description ? description : 'Description is not available' }}></p>
                <p className="mt-2 text-lg text-[#323232]">Team BOVA</p>
            </div>

           {currentPassword &&
                <div className='update-password-outer w-full max-w-5xl mt-5 items-center border border-solid border-[#AFAAAC] px-[16px]  md:px-5 py-3 rounded-[15px] flex gap-3'>
                    <div className='w-full'>
                        <p className='text-gray-600 text-lg'>Password: <span className='text-xl ml-2'>{currentPassword}</span></p></div>
                    <div className='w-full'>
                        <input
                            type='password'
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className='w-full border border-[#AFAAAC] focus:border-[#25464f] rounded-[8px] p-3 h-[42px] rounded focus:outline-none ' />
                    </div>
                    
                    {errorMessage && (
                        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                    )}

                    <div className='w-full max-w-[101px] text-end'>
                        <button
                            // className={`py-2 px-4 border bg-customBg2 hover:bg-inherit hover:text-customBg2 border-customBg2' } border border-customBg2 text-white rounded-[8px]`}
                            className={`py-2 px-4 border bg-customBg2 ${updateLoader
                                ? 'bg-gray-300 border-gray-300 text-gray-500 hover:bg-#d1d5db cursor-not-allowed'
                                : 'hover:bg-inherit hover:text-customBg2 border-customBg2'
                                } border border-customBg2 text-white rounded-[8px]`}
                            onClick={handleUpdatePassword}
                            disabled={updateLoader}
                        > {updateLoader ? 'Updating' : 'Update'} </button>
                    </div>
                </div>
            }

            <div className="flex flex-col mt-8">
                <div className="w-full max-w-5xl bg-white rounded-lg border border-[#AFAAAC]">
                    <h2 className="text-lg md:text-xl font-bold text-[#2b6175]  p-[16px] md:p-5 border-b border-[#AFAAAC]">BOVA Patient Order Form</h2>
                    <div className="border-b border-[#AFAAAC] flex items-center p-5 pb-4 md:pb-6 max-[767px]:flex-wrap">
                        <div className='patient-details max-w-[300px] w-full'>
                            {/* <div className="flex items-center mb-4">
                                {/* <span className="text-gray-600">Add Patient</span> 
                            </div> */}
                            <Link href='/patients/create' className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-inherit">
                                Add Patient
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500 mt-4 md:mt-2 w-full">Add patient button takes you to the patient information form.</p>
                    </div>

                    {/* Existing Patients Section */}
                    <div className="p-5 max-[767px]:pb-4 flex items-center max-[767px]:flex-wrap">
                        <div className="patient-details max-w-[300px] w-full">
                            {patients.map((patient, index) => (
                                <div className="flex items-center mb-4" key={patient._id}>
                                    <div className="custom-checkbox">
                                        <input
                                            type="checkbox"
                                            name={`patient`}
                                            value={patient._id}
                                            checked={selectedPatient === patient._id}
                                            className="mr-2"
                                            onChange={() =>
                                                setSelectedPatient(selectedPatient === patient._id ? null : patient._id)
                                            }
                                        />
                                        <span><CheckIcon />
                                        </span>
                                    </div>
                                    <span className="text-gray-600">{`${patient.firstName} ${patient.lastName}`}</span>
                                </div>
                            ))}

                            <button
                                className={`py-2 px-4 border bg-customBg2 ${!selectedPatient
                                    ? 'bg-gray-300 border-gray-300 text-gray-500 hover:bg-#d1d5db cursor-not-allowed'
                                    : 'hover:bg-inherit hover:text-customBg2 border-customBg2'
                                    } border border-customBg2 text-white rounded-[8px]`}
                                onClick={() => handleRedirect(selectedPatient)}
                                disabled={!selectedPatient}
                            >
                                Updates Required
                            </button>
                        </div>
                        <p className="text-sm w-full text-gray-500 mt-2">
                            Select the patients you would like to update/review request.
                        </p>
                    </div>

                    {/* Profit Margin Section */}
                    <div className="border-t border-[#AFAAAC] p-5 pt-4 text-gray-600">
                        <p>Profit Margin: {session?.userDetail?.commissionPercentage}%</p>
                    </div>
                </div>

            </div >
        </>

    )
}
