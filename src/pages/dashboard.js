
import { useAppContext } from '../context/AppContext';
import Link from 'next/link';
import AppLayout from '../components/Applayout'

export default function Dashboard() {
    const { session, selectedPatient, setSelectedPatient, isSidebarOpen, toggleSidebar } = useAppContext();

    return (
      <AppLayout>
            <div className="min-h bg-gray-50 flex flex-col p-6">
                <h1 className='page-title pt-2 pb-3 text-2xl font-semibold'>Home</h1>
                <div className="w-full max-w-3xl bg-white rounded-lg border border-[#AFAAAC]">
                    <h2 className="text-xl font-semibold mb-4 p-5 border-b border-[#AFAAAC]">BOVA Patient Order Form</h2>
                    <div className="border-b border-[#AFAAAC] flex items-center p-5 pb-4 mb-4">

                        <div className='patient-details max-w-[300px] w-full'>
                        <div className="flex items-center mb-2">
                            <input type="checkbox" name="patient" className="mr-2" />
                            <span className="text-gray-600">Add Patient</span>
                        </div>
                        <button className=" py-2 px-4 bg-customBg2 text-white rounded hover:bg-customText">
                        <Link href="/patients/create"> Add Patient</Link>
                        </button>
                        </div>

                        <p className="text-sm text-gray-500 mt-2 w-full">Add patient button takes you to the patient information form.</p>

                    </div>

                    {/* Existing Patients Section */}
                    <div className="mb-4 p-5 flex items-center">
                    <div className='patient-details max-w-[300px] w-full'>
                        <div className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                name="patient"
                                className="mr-2"
                            />
                            <span className="text-gray-600">Alex Smith</span>
                        </div>
                        <div className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                name="patient"
                                className="mr-2"
                            />
                            <span className="text-gray-600">Andrea Gold</span>
                        </div>
                        <button className="py-2 px-4 bg-customBg2 text-white rounded hover:bg-customText">
                            Updates Required
                        </button>

                        </div>

                        <p className="text-sm w-full text-gray-500 mt-2">Select the patients you would like to update/review request.</p>
                    </div>

                    {/* Profit Margin Section */}
                    <div className="border-t border-[#AFAAAC] p-5 pt-4 text-gray-600">
                        <p>Profit Margin: 25%</p>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="w-full max-w-3xl bg-[#d6dee5] p-8 mt-6 rounded-lg">
                    <p>Welcome to your BOVA <span className="font-semibold">[Name of Doctor]</span></p>
                    <p className="mt-2">We will be launching the full site access in less than 2 weeks!</p>
                    <p className="mt-2 font-semibold">Stay tuned.<br />Team BOVA</p>
                </div>
            </div>
        </AppLayout>
    )
}
