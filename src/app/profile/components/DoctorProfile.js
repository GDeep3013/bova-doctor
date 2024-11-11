'use client'
import React from 'react'
import Link from 'next/link';
import AppLayout from 'components/Applayout';

export default function Profile() {


    return (
        <AppLayout>
            <div className="flex flex-col">

                <h1 className='page-title pt-2 text-2xl pb-1'>Patient Profile</h1>
                <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>

                <div className="w-full max-w-3xl bg-white rounded-lg border border-[#AFAAAC]">

                    <div className="space-y-2 text-gray-700">
                        <div className="bg-customBg p-4 px-5 rounded-t-[8px] flex justify-between items-center">
                            <span className="font-medium text-base text-gray-700">
                                Patient Name: <span>Mary Klein</span>
                            </span>
                            <span className="text-gray-600 text-base">Date Created: 10.21.24</span>
                        </div>
                        <div className='px-5'>
                            <p className='flex justify-between py-2'>
                                <span className="text-textColor text-base">Patient Email:</span> <span className='text-left min-w-[126px]'> mary@gmail.com </span>
                            </p>
                            <p className='flex justify-between py-2'>
                                <span className="text-textColor text-base">Patient Phone Number:</span> <span className='text-left min-w-[126px]'> 1-778-888-9999 </span>
                            </p>
                            <p className='flex justify-between py-2'>
                                <span className="text-textColor text-base">Discount Rate:</span> <span className='text-left min-w-[126px]'> 10% </span>
                            </p>
                            <p className='flex justify-between py-2'>
                                <span className="text-textColor text-base">Current Subscriptions:</span> <span className='text-left min-w-[126px]'> L-01 </span>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 py-3 mt-4 flex justify-end border-t border-[#AFAAAC]">
                        <Link href="/create-plan">
                            <button className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-inherit min-w-[150px] min-h-[46px]">
                                Create Plan
                            </button>
                        </Link>
                    </div>
                </div>

            </div>
        </AppLayout>
    )
}
