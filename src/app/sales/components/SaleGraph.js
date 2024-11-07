'use client'
import { React } from 'react';

const SalesGraph = () => {

    return (
        <div className="flex space-x-4">
            {/* Monthly Earnings Card */}
            <div className="w-full flex flex-col justify-between">
                <div className='bg-[#F9F9F9] rounded-[8px] h-full'>
                <div>
                    <h3 className="text-2xl font-semibold mt-[29px] ml-[29px]">$12,000.50</h3>
                    <p className="text-gray-500 ml-[29px]">Total Amount Earned this Month</p>
                </div>
                <div className="mt-4">
                   <img src='/images/chart1.png' alt='chart image' className='w-full'/>
                </div>
                </div>
                <p className="text-center text-gray-500 mt-4">Total Amount Earned this Month: $12,000.50</p>
            </div>

            {/* Weekly Earnings Card */}
            <div className="w-full flex flex-col justify-between">
            <div className='bg-[#F9F9F9] rounded-[8px] h-full'>
                <div>
                    <h3 className="text-2xl font-semibold mt-[29px] ml-[29px]">$4,300.50</h3>
                    <p className="text-gray-500 ml-[29px]">Total Amount Earned this Week</p>
                </div>
                <div className="mt-4 p-4">
                <img src='/images/chart2.png' alt='chart image' className='w-full'/>
                </div>
                </div>
                <p className="text-center text-gray-500 mt-4">Total Amount Earned this Week: $4,300.50</p>
            </div>
        </div>
    );
};

export default SalesGraph;
