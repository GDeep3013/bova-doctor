'use client'
import { React } from 'react';

const DoctorGraph = () => {

    return (
        <div className="flex space-x-4">
            <div className="w-full flex flex-col justify-between">
                <div className='bg-[#F9F9F9] rounded-[8px] h-full'>
                <div>
                    <h3 className="text-xl md:text-2xl font-semibold mt-[29px] ml-[29px]">$12,000.50</h3>
                    <p className="text-gray-500 ml-[29px]">Total Amount Earned this Month</p>
                </div>
                <div className="mt-8">
                   <img src='/images/chart1.png' alt='chart image' className='w-full'/>
                </div>
                </div>
            </div>

        </div>
    );
};

export default DoctorGraph;
