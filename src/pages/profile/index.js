import React from 'react'
import Link from 'next/link';
import AppLayout from '../../components/AppLayout'

export default function profile() {
    return (
        <AppLayout>
            <div className="dashboard-outer flex">

                <div className='dashboard-right w-full'>
                    <div className="min-h bg-gray-50 flex flex-col p-6">
                        <h1 className="page-title pt-2 pb-3 text-2xl font-semibold">Patient Profile</h1>
                        <button className="text-gray-600 text-sm mb-4 text-left">&lt; Back</button>

                        <div className="w-full max-w-3xl bg-white rounded-lg border border-[#AFAAAC]">
                            {/* Header */}
                            <div className="bg-gray-200 p-4 rounded-t-lg flex justify-between items-center">
                                <span className="font-medium text-gray-700">
                                    Patient Name: <span className="font-bold">Mary Klein</span>
                                </span>
                                <span className="text-gray-600 text-sm">Date Created: 10.21.24</span>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-2 text-gray-700">
                                <p>
                                    <span className="font-medium">Patient Email:</span> mary@gmail.com
                                </p>
                                <p>
                                    <span className="font-medium">Patient Phone Number:</span> 1-778-888-9999
                                </p>
                                <p>
                                    <span className="font-medium">Discount Rate:</span> 10%
                                </p>
                                <p>
                                    <span className="font-medium">Current Subscriptions:</span> L-01
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-300 flex justify-end">
                                <Link href="/create-plan">
                                <button className="py-2 px-4 bg-customBg2 text-white rounded hover:bg-customText">
                                    Create Plan
                                </button>
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
