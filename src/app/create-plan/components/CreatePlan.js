
'use client'
import AppLayout from 'components/Applayout';
import React, { useState } from 'react';
import Link from 'next/link'
export default function CreatePlan() {
    const [selectedProduct, setSelectedProduct] = useState('L-01');
    const [quantity, setQuantity] = useState('5 (recommended)');
    const [frequency, setFrequency] = useState('Once Per Day (Anytime)');
    const [duration, setDuration] = useState('Once Per Day');
    const [takeWith, setTakeWith] = useState('Water');
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');

    const breadcrumbItems = [
        { label: 'Plans', href: '/create-plan' },     
        { label: 'Create Patient Plan', href: '/create-plan', active: true },
    ];

    return (
        <AppLayout>
            <div className="bg-[#EBEDEB] flex flex-col">
                <nav aria-label="Breadcrumb" className="text-gray-600 text-sm">
                    <ol className="flex space-x-2">
                        {breadcrumbItems.map((item, index) => (
                            <li key={index} className="flex items-center">
                                {index > 0 && <span className="mx-2 text-xl"> ›› </span>}
                                {item.active ? (
                                    <span className="font-medium text-black text-xl">{item.label}</span>
                                ) : (
                                    <Link href={item.href} className="text-[#757575] text-xl hover:underline">
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
                <div className="mt-8 flex gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-4 rounded-lg bg-white shadow-lg w-full">
                        {/* Patient Info */}
                        <div className="bg-customBg3 p-4 rounded-t-lg flex justify-between items-center">
                            <span className="font-medium text-[19px] text-black">
                                Patient Name: <span className="font-bold">Mary Klein</span>
                            </span>
                        </div>
                        <div className='p-5'>
                            {/* Product Selection */}
                            <div className="p-4">
                                <span className="text-textColor font-medium cursor-pointer">Select Items:</span>
                                <div className="flex space-x-4 mt-2">
                                    {/* Thumbnail images */}
                                    <div className='thumbnail-box'>
                                        <img
                                            src="/images/product-img1.png" // Replace with actual paths
                                            alt="L-01"
                                            className={`w-[117px] h-[106px] p-3 ${selectedProduct === 'L-01' ? 'bg-white shadow-2xl' : 'bg-[#F9F9F9]'} rounded-[8px]`}
                                            onClick={() => setSelectedProduct('L-01')}
                                        />
                                        <p className={`font-bold text-base text-center pt-2 ${selectedProduct === 'L-01' ? 'text-black' : 'text-textColor'}`}>
                                            L-01
                                        </p>
                                    </div>
                                    <div className='thumbnail-box'>
                                        <img
                                            src="/images/product-img2.png" // Replace with actual paths
                                            alt="L-01 Refill"
                                            className={`w-[117px] h-[106px] p-3 ${selectedProduct === 'L-01 Refill' ? 'bg-white shadow-2xl' : 'bg-[#F9F9F9]'} rounded-[8px]`}
                                            onClick={() => setSelectedProduct('L-01 Refill')}
                                        />
                                        <p className={`font-bold text-base text-center pt-2 ${selectedProduct === 'L-01 Refill' ? 'text-black' : 'text-textColor'}`}>
                                            L-01 Refill
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Product Info */}
                            <div className="p-4 border-t border-[#AFAAAC] flex gap-4">
                                <div className="pr-9 w-full max-w-[400px]">
                                    <img src="/images/product-img1.png" alt="Product" className="w-24 h-24" />
                                    <div>
                                        <h3 className="font-bold text-[18px]">BOVA L-01</h3>
                                        <p className="text-textColor mt-2 text-base max-w-[200px]">
                                            <span className='font-bold w-full inline-block'>Ingredients:</span> 100% Grass Fed & Finished New Zealand Beef Liver.
                                            300mg per Capsule
                                        </p>
                                    </div>
                                </div>
                                {/* Product Options */}
                                <div className="mt-4 w-full">
                                    <div>
                                        <select
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                        >
                                            <option>Capsules 5 (recommended)</option>
                                            <option>10</option>
                                            <option>15</option>
                                        </select>
                                    </div>
                                    <div>
                                        <select
                                            value={frequency}
                                            onChange={(e) => setFrequency(e.target.value)}
                                            className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                        >
                                            <option>Frequency Once Per Day (Anytime)</option>
                                            <option>Twice Per Day</option>
                                            <option>Three Times Per Day</option>
                                        </select>
                                    </div>
                                    <div>
                                        <select
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                        >
                                            <option>Duration Once Per Day</option>
                                            <option>Twice Per Day</option>
                                        </select>
                                    </div>
                                    <div>
                                        <select
                                            value={takeWith}
                                            onChange={(e) => setTakeWith(e.target.value)}
                                            className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                        >
                                            <option>Take with Water</option>
                                            <option>Juice</option>
                                        </select>
                                    </div>
                                    <div>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-4 mt-1 mb-4 resize-none"
                                            rows="4"
                                            placeholder="Add Notes"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            {/* Message Section */}
                            <div className="p-4 border-t border-b border-[#AFAAAC]">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-4 mt-1 mb-4 resize-none"
                                    rows="4"
                                    placeholder="Message"
                                ></textarea>
                            </div>
                            {/* Send to Patient Button */}
                            <div className="p-4 text-right">
                                <button className="min-w-[150px] py-2 bg-black text-white font-medium rounded hover:bg-customText focus:outline-none">
                                    Send to Patient
                                </button>
                            </div>
                        </div>

                    </div>
                    {/* Right Column - Price Summary */}
                    <div className="space-y-4 w-full max-w-[310px]">
                        <div className="bg-white rounded-lg">
                            <div className="bg-customBg3 p-4 rounded-t-lg flex justify-between items-center">
                                <span className="font-medium text-gray-700">
                                    Patient Name: <span className="font-bold">Mary Klein</span>
                                </span>
                            </div>
                            <div className='p-5'>
                                <div className="mt-2 space-y-2">
                                    <div className="flex justify-between">
                                        <span className='text-textColor text-regular'>Product: L-01</span>
                                        <span className='text-textColor2'>$68.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className='text-textColor text-regular'>Patient Discount (10%)</span>
                                        <span className='text-textColor2'>-$6.80</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[#AFAAAC] pb-4">
                                        <span className='text-textColor text-regular'>Subtotal</span>
                                        <span className='text-textColor2'>$58.00</span>
                                    </div>
                                </div>
                                <div className='text-center py-5'>
                                    <button className="min-w-[150px] mr-auto py-2 bg-black text-white rounded hover:bg-customText focus:outline-none">
                                        Send to Patient
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
