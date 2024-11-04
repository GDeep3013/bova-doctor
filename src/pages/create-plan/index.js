import React, { useState } from 'react';
import AppLayout from '../../components/AppLayout'

export default function CreatePlan() {
    const [selectedProduct, setSelectedProduct] = useState('L-01');
    const [quantity, setQuantity] = useState('5 (recommended)');
    const [frequency, setFrequency] = useState('Once Per Day (Anytime)');
    const [duration, setDuration] = useState('Once Per Day');
    const [takeWith, setTakeWith] = useState('Water');
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');

    return (
        <AppLayout>
            <div className="dashboard-outer flex">
                <div className='dashboard-right w-full'>
                    <div className="min-h bg-gray-50 flex flex-col p-6">
                        <h1 className="page-title pt-2 pb-3 text-2xl font-semibold">Create Patient Plan</h1>
                        <button className="text-gray-600 text-sm mb-4 text-left">&lt; Back</button>
                        <div className="max-w-5xl mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column */}
                            <div className="lg:col-span-2 space-y-4 rounded-lg border border-[#AFAAAC]">
                                {/* Patient Info */}
                                <div className="bg-gray-200 p-4 rounded-t-lg flex justify-between items-center">
                                    <span className="font-medium text-gray-700">
                                        Patient Name: <span className="font-bold">Mary Klein</span>
                                    </span>
                                </div>
                                {/* Product Selection */}
                                <div className="p-4">
                                    <span className="text-gray-700 font-medium cursor-pointer">Select Items:</span>
                                    <div className="flex space-x-4 mt-2">
                                        {/* Thumbnail images */}
                                        <img
                                            src="/images/product-img1.jpg" // Replace with actual paths
                                            alt="L-01"
                                            className={`w-16 h-16 border ${selectedProduct === 'L-01' ? 'border-blue-500' : 'border-gray-300'} rounded`}
                                            onClick={() => setSelectedProduct('L-01')}
                                        />
                                        <img
                                            src="/images/product-img2.png" // Replace with actual paths
                                            alt="L-01 Refill"
                                            className={`w-16 h-16 border ${selectedProduct === 'L-01 Refill' ? 'border-blue-500' : 'border-gray-300'} rounded`}
                                            onClick={() => setSelectedProduct('L-01 Refill')}
                                        />
                                    </div>
                                </div>
                                {/* Product Info */}
                                <div className="p-4  border-t border-[#AFAAAC] grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="pr-9">
                                        <img src="/images/product-img1.jpg" alt="Product" className="w-24 h-24" />
                                        <div>
                                            <h3 className="font-bold">BOVA L-01</h3>
                                            <p className="text-gray-600 text-sm">
                                                Ingredients: 100% Grass Fed & Finished New Zealand Beef Liver.
                                                300mg per Capsule
                                            </p>
                                        </div>
                                    </div>
                                    {/* Product Options */}
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium">Capsules</label>
                                            <select
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                className="w-full border rounded p-2 mt-1"
                                            >
                                                <option>5 (recommended)</option>
                                                <option>10</option>
                                                <option>15</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Frequency</label>
                                            <select
                                                value={frequency}
                                                onChange={(e) => setFrequency(e.target.value)}
                                                className="w-full border rounded p-2 mt-1"
                                            >
                                                <option>Once Per Day (Anytime)</option>
                                                <option>Twice Per Day</option>
                                                <option>Three Times Per Day</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Duration</label>
                                            <select
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="w-full border rounded p-2 mt-1"
                                            >
                                                <option>Once Per Day</option>
                                                <option>Twice Per Day</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Take with</label>
                                            <select
                                                value={takeWith}
                                                onChange={(e) => setTakeWith(e.target.value)}
                                                className="w-full border rounded p-2 mt-1"
                                            >
                                                <option>Water</option>
                                                <option>Juice</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Add Notes</label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                className="w-full border rounded p-2 mt-1"
                                                rows="3"
                                                placeholder="Add any notes here"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                                {/* Message Section */}
                                <div className="p-4 border-t border-b border-[#AFAAAC]">
                                    <label className="block text-sm font-medium">Message</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full border rounded p-2 mt-1"
                                        rows="3"
                                        placeholder="Message to patient"
                                    ></textarea>
                                </div>
                                {/* Send to Patient Button */}
                                <div className="p-4 text-right">
                                    <button className="min-w-[150px] py-2 bg-customBg2 text-white font-medium rounded hover:bg-customText focus:outline-none">
                                        Send to Patient
                                    </button>
                                </div>
                            </div>
                            {/* Right Column - Price Summary */}
                            <div className="space-y-4">
                                <div className="bg-gray-200 p-4 rounded-lg">
                                    <h3 className="font-bold text-slate-600">PRICE</h3>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className='text-slate-500'>Product: L-01</span>
                                            <span className='text-slate-500'>$68.00</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className='text-slate-500'>Patient Discount (10%)</span>
                                            <span className='text-slate-500'>-$6.80</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg border-b border-[#AFAAAC] pb-4">
                                            <span className='text-slate-500'>Subtotal</span>
                                            <span className='text-slate-500'>$58.00</span>
                                        </div>
                                    </div>
                                    <div className='text-right py-5'>
                                    <button className="min-w-[150px] mr-auto py-2 bg-customBg2 text-white font-medium rounded hover:bg-customText focus:outline-none">
                                        Send to Patient
                                    </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

        </AppLayout>
    )
}
