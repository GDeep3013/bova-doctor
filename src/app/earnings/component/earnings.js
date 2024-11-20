'use client'
import AppLayout from 'components/Applayout';
import DoctorGraph from './doctarGraph';
import Sales from './Sales';
import Loader from 'components/loader';
import { useState } from 'react';

export default function Earnings() {

    const[fetchLoader,setFetchLoader]=useState(false)
    return (
        <AppLayout>
            {/* {fetchLoader ? <Loader /> : */}
                <>
            <h1 className="text-2xl pt-4 md:pt-1 mb-1">Earnings</h1>
            <div className='grid grid-cols-12 gap-5 mt-6'>
                <div className='col-span-12 xl:col-span-4'>
                    <Sales />
                </div>
                <div className='col-span-12 xl:col-span-8'>
                    <div className='w-full'>
                        <div className=''>
                            <DoctorGraph fetchLoader={fetchLoader} setFetchLoader={setFetchLoader } />
                        </div>
                    </div>
                </div>
            </div>
            </>  
             {/* } */}
        </AppLayout>
    )
}
