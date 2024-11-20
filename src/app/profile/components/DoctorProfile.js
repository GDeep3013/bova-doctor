'use client'
import React from 'react'
import Link from 'next/link';
import AppLayout from 'components/Applayout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Loader from 'components/loader';
export default function Profile() {
    const router = useRouter()
    const { data: session } = useSession();
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
        });
    }
  
    return (
        <AppLayout>
            <div className="flex flex-col">
                {!session ? <Loader /> : <>
                    <h1 className='page-title pt-4 md:pt-2 text-2xl pb-1'>Doctor Profile</h1>
                    <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>

                    <div className="w-full max-w-3xl bg-white rounded-lg border border-[#AFAAAC]">

                        <div className="space-y-2 text-gray-700">
                            <div className="bg-customBg p-4 px-3 md:px-5 rounded-t-[8px] flex justify-between items-center">
                                <span className="font-medium text-[14px] md:text-base text-gray-700">
                                    Name: <span>{session?.userDetail?.firstName}  {session?.userDetail?.lastName}</span>
                                </span>
                                <span className="text-gray-600 text-[14px] md:text-base">Date Created: {formatDate(session?.userDetail?.createdAt)}  </span>

                            </div>
                            <div className='px-5'>
                                <p className='flex justify-between py-2'>
                                    <span className="text-textColor text-[14px] md:text-base"> Email</span> <span className='text-left text-[14px] md:text-base min-w-[126px]'>{session?.userDetail?.email} </span>
                                </p>
                                <p className='flex justify-between py-2'>
                                    <span className="text-textColor text-[14px] md:text-base"> Phone Number</span> <span className='text-left text-[14px] md:text-base min-w-[126px]'>{session?.userDetail?.phone} </span>
                                </p>
                                <p className='flex justify-between py-2'>
                                    <span className="text-textColor text-[14px] md:text-base"> Specialty</span> <span className='text-left text-[14px] md:text-base min-w-[126px]'>{session?.userDetail?.specialty} </span>
                                </p>
                                <p className='flex justify-between py-2'>
                                    <span className="text-textColor text-[14px] md:text-base"> Clinic Name</span> <span className='text-left text-[14px] md:text-base min-w-[126px]'>{session?.userDetail?.clinicName} </span>
                                </p>
                                <p className='flex justify-between py-2'>
                                    <span className="text-textColor text-[14px] md:text-base">Commission %</span> <span className='text-left text-[14px] md:text-base min-w-[126px]'> {session?.userDetail?.commissionPercentage}% </span>
                                </p>

                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 py-3 mt-4 flex justify-end border-t border-[#AFAAAC]">
                            <Link href="/plans/create-plan">
                                <button className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-inherit min-w-[150px] min-h-[46px]">
                                    Create Plan
                                </button>
                            </Link>
                        </div>
                    </div>
                </>}
            </div>
        </AppLayout>
    )
}
