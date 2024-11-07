'use client'
import React, { useState } from 'react';
import AppLayout from 'components/Applayout';
import { ReactionIcon, CardIcon, WalletIcon } from 'components/svg-icons/icons';
import SalesGraph from './SaleGraph';


export default function Sales() {
  const cards = [
    {
        title: '24 Patients',
        subtitle: 'Total Patients Using BOVA',
        icon: <ReactionIcon />,
    },
    {
        title: '45',
        subtitle: 'Total Number of Subscriptions',
        icon: <CardIcon />,
    },
    {
        title: '$22,300.50',
        subtitle: 'Total Amount Earned to Date',
        icon: <WalletIcon />,
    },
];

  return (

    <AppLayout>
      <div className="flex flex-col">

        <div className='bg-white order-form pb-12'>
          <div className="w-full bg-[#CDD3CC] order-form flex justify-between items-center p-4 mb-4">
            <p className="text-black font-medium">Sales</p>
            <button className="bg-black text-white font-medium px-4 py-2 rounded">Review Plan (2)</button>
          </div>
          <div className="flex space-x-4 px-[43px] py-[38px] pb-[27px]">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="flex justify-between items-center bg-[#F9F9F9] rounded-lg p-4 w-full shadow-sm"
                >
                    <div>
                        <h3 className="text-2xl font-semibold">{card.title}</h3>
                        <p className="text-base mt-1 text-gray-500">{card.subtitle}</p>
                    </div>
                    <div className="flex-shrink-0 bg-[#EBEDEB] w-[41px] h-[41px] rounded-[5px] shadow-sm relative card-icon">
                      <div className="text-3xl text-black absolute card-svg">
                        {card.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="px-[43px]">
            <SalesGraph />
        </div>

        </div>
      </div>
    </AppLayout>
  );
}
