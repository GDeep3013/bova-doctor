"use client"
import AppLayout from 'components/Applayout';
import React, { useState, useEffect, } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
// import "react-quill/dist/quill.snow.css";
import '../../../quill.css';
import dynamic from 'next/dynamic';
// import ReactQuill from 'react-quill-new';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
const ThemeCustomized = () => {
  const router = useRouter();
  const [newDoctorTitle, setNewDoctorTitle] = useState('');
  const [newDoctorDescription, setNewDoctorDescription] = useState('');
  const [oldDoctorTitle, setOldDoctorTitle] = useState('');
  const [oldDoctorDescription, setOldDoctorDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [oldDoctorId, setOldDoctorId] = useState('');
  const [newDoctorId, setNewDoctorId] = useState('');

  // Validate the forms
  const validateFormNewDoctor = () => {
    let valid = true;
    const newErrors = {};
    if (!newDoctorTitle) {
      newErrors.newDoctorTitle = 'Title is required';
      valid = false;
    }
    if (!newDoctorDescription) {
      newErrors.newDoctorDescription = 'Description is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };
  const validateFormOldDoctor = () => {
    let valid = true;
    const newErrors = {};
    const plainTextDescription = oldDoctorDescription.replace(/<[^>]*>/g, '').trim();
    if (!oldDoctorTitle) {
      newErrors.oldDoctorTitle = 'Title is required';
      valid = false;
    }
    if (!plainTextDescription) {
      newErrors.oldDoctorDescription = 'Description is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };
  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/template/edit`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setNewDoctorId(data?.newDoctorTemplates[0]?._id)
      setNewDoctorTitle(data?.newDoctorTemplates[0]?.title)
      setNewDoctorDescription(data?.newDoctorTemplates[0]?.description)

      setOldDoctorId(data?.oldDoctorTemplates[0]?._id)
      setOldDoctorTitle(data?.oldDoctorTemplates[0]?.title)
      setOldDoctorDescription(data?.oldDoctorTemplates[0]?.description)



    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };
  useEffect(() => { fetchTemplates() }, [])

  // Handle saving for New Doctor
  const handleSaveNewDoctor = async (e) => {
    e.preventDefault();
    if (validateFormNewDoctor()) {
      try {
        const response = await fetch('/api/template/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorType: 'new', title: newDoctorTitle, description: newDoctorDescription }),
        });
        if (!response.ok) throw new Error('Failed to save template');
        Swal.fire({
          title: 'Success!',
          iconHtml: '<img src="/images/succes_icon.png" alt="Success Image" className="custom-icon" style="width: 63px; height: 63px;">',
          text: 'New Doctor Template Updated Successfully!',
          confirmButtonText: 'OK',
          confirmButtonColor: "#3c96b5",
        });
        fetchTemplates();

      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'There was an error updating the New Doctor Template.',
          icon: 'error',
          confirmButtonText: 'Try Again',
        });
        console.error('Error saving new doctor template:', error);
      }
    }
  };

  // Handle saving for Old Doctor
  const handleSaveOldDoctor = async (e) => {
    e.preventDefault();
    if (validateFormOldDoctor()) {
      try {
        const response = await fetch('/api/template/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorType: 'old', title: oldDoctorTitle, description: oldDoctorDescription }),
        });
        if (!response.ok) throw new Error('Failed to save template');
        Swal.fire({
          title: 'Success!',
          iconHtml: '<img src="/images/succes_icon.png" alt="Success Image" className="custom-icon" style="width: 63px; height: 63px;">',
          text: 'Old Doctor Template Updated Successfully!',
          confirmButtonText: 'OK',
          confirmButtonColor: "#3c96b5",
        });
        // alert('Old Doctor Template saved successfully!');
        fetchTemplates();
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'There was an error updating the Old Doctor Template.',
          icon: 'error',
          confirmButtonText: 'Try Again',
        });
        console.error('Error saving old doctor template:', error);
      }
    }
  };

  return (
    <AppLayout>
      <div className='theme-customizer'>
        <div className='flex justify-between items-start mt-4 md:mt-2 mb-4 md:mb-2'>
          <div>
            <h1 className="text-2xl">Welcome Notification for Doctors</h1>
            <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>
          </div>

        </div>
        <div className="max-w-3xl11 mx-auto grid grid-cols-2 gap-8">
          {/* New Doctor Form */}
          <div className="form-control border rounded-md">
            <h2 className="text-xl text-[#53595B] font-semibold">New Doctors Notification</h2>
            <div className='p-4'>
              <div className='form-field mb-4'>
                <label>Title</label>
                <input
                  type="text"
                  value={newDoctorTitle}
                  onChange={(e) => setNewDoctorTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                />
                {errors.newDoctorTitle && <p className="text-red-500 text-sm">{errors.newDoctorTitle}</p>}
              </div>
              <div className='form-field mb-4'>
                <label>Description</label>
                <ReactQuill
                  theme="snow"
                  value={newDoctorDescription}
                  onChange={(value) => setNewDoctorDescription(value)}
                  modules={{
                    toolbar: [
                      [{ 'header': '1' }, { 'header': '2' },],
                      [{ 'list': 'ordered' },{ 'list': 'bullet' }],
                      ['bold', 'italic', 'underline',]
                    ]
                  }}
                  formats={['header', 'font', 'list','bullet', 'bold', 'italic', 'underline',
                  ]}
                  placeholder="Write some description..."
                />
                {/* <textarea
                  value={newDoctorDescription}
                  onChange={(e) => setNewDoctorDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300 h-32"
                ></textarea> */}
                {errors.newDoctorDescription && <p className="text-red-500 text-sm">{errors.newDoctorDescription}</p>}
              </div>
              <button
                onClick={handleSaveNewDoctor}
                className="px-6 py-2 bg-customBg2 border border-customBg2 text-white hover:text-customBg2 rounded-md hover:bg-inherit"
              >
                {newDoctorId ? " Update Template" : "Save Template"}
              </button>
            </div>
          </div>

          {/* Old Doctor Form */}
          <div className="form-control border rounded-md">
            <h2 className="text-xl text-[#53595B] font-semibold">Old Doctors Notification</h2>
            <div className='p-4'>
              <div className='form-field mb-4'>
                <label>Title</label>
                <input
                  type="text"
                  value={oldDoctorTitle}
                  onChange={(e) => setOldDoctorTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                />
                {errors.oldDoctorTitle && <p className="text-red-500 text-sm">{errors.oldDoctorTitle}</p>}
              </div>
              <div className='form-field mb-4'>
                <label>Description</label>
                {/* <textarea
                  value={oldDoctorDescription}
                  onChange={(e) => setOldDoctorDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300 h-32"
                ></textarea> */}
                <ReactQuill
                  theme="snow"
                  onChange={(value) => setOldDoctorDescription(value)}
                  value={oldDoctorDescription}
                  modules={{
                    toolbar: [
                      [{ 'header': '1' }, { 'header': '2' },],
                      [{ 'list': 'ordered' },{ 'list': 'bullet' }],
                      ['bold', 'italic', 'underline',]

                    ]
                  }}
                  formats={['header', 'font', 'list','bullet', 'bold', 'italic', 'underline',
                  ]}
                  placeholder="Write some description..."
                />
                {errors.oldDoctorDescription && <p className="text-red-500 text-sm">{errors.oldDoctorDescription}</p>}
              </div>
              <button
                onClick={handleSaveOldDoctor}
                className="px-6 py-2 bg-customBg2 border border-customBg2 text-white hover:text-customBg2 rounded-md hover:bg-inherit"
              >
                {oldDoctorId ? " Update Template" : "Save  Template"}
              </button>
            </div>
          </div>
          <div className='note'>
          </div>
        </div>
        <div className="bg-[#f7f7f7] border-l-4 border-gray-500 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-[#53595B] flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            <div>
              <p className="text-lg text-[#53595B] font-bold">Note:</p>
              <p className="text-sm text-[#53595B]">
                Use the following variables in your template:
              </p>
            </div>
          </div>
          <ul className="list-disc mt-4 ml-8 space-y-2 text-gray-800 text-sm">
            <li className="text-[#53595B]">[Doctor&apos;s Name]</li>
            <li className="text-[#53595B]">[Doctor&apos;s Email]</li>
            <li className="text-[#53595B]">[Doctor&apos;s Phone]</li>
            <li className="text-[#53595B]">[Doctor&apos;s Specialty]</li>
            <li className="text-[#53595B]">[Doctor&apos;s Clinic]</li>
            <li className="text-[#53595B]">[Doctor&apos;s Commission]</li>
          </ul>
        </div> </div>
    </AppLayout>
  );
};

export default ThemeCustomized;
