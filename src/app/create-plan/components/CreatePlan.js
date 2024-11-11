
'use client'
import AppLayout from 'components/Applayout';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import Swal from 'sweetalert2';

import { useRouter, useParams } from 'next/navigation';

export default function CreatePlan() {
    const { id } = useParams();

    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [formData, setFormData] = useState({ items: [], message: '', patient_id: id });

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch('/api/shopify/products');
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        }
        fetchProducts();
    }, []);


    const handleSelectProduct = (product) => {

        setSelectedItems((prevSelectedItems) => {
            const productExists = prevSelectedItems.some((item) => item.id === product.id);
            if (productExists) return prevSelectedItems;
            return [...prevSelectedItems, product];
        });


        setFormData((prevData) => {
            // Update the form data with the new value for the specified field
            const updatedItems = prevData.items

            // Check for duplicates based on the id before adding a new item
            const newItem = {
                id: product.variants[0]?.id,
                quantity: "5",
                properties: {
                    frequency: 'Once Per Day (Anytime)',
                    duration: 'Once Per Day',
                    takeWith: 'Water',
                    notes: '',
                }
            };


            // Avoid adding the item if it already exists based on the `id`
            if (!updatedItems.some(item => item.id === product.variants[0]?.id)) {
                updatedItems.push(newItem);
            }

            return { ...prevData, items: updatedItems };
        });


        // setFormData((prevData) => {
        //     const productExists = prevData.items.some((item) => item.id === product.variants[0]?.id);
        //     if (productExists) return prevData;

        //     // Update the form data with the new value for the specified field
        //     let updatedItems = [];

        //     // Check for duplicates based on the id before adding a new item
        //     const newItem = {
        //       id: product.variants[0]?.id,
        //       quantity: "5",
        //       properties: {
        //         frequency: 'Once Per Day (Anytime)',
        //         duration: 'Once Per Day',
        //         takeWith: 'Water',
        //         notes: '',
        //       }
        //       };


        //     // Avoid adding the item if it already exists based on the `id`
        //     updatedItems.push(newItem);

        //     console.log(updatedItems, "updatedItems")

        //     return { ...prevData, items: updatedItems};
        //   });


    };
    function handleFormDataChange(itemId, field, value) {
        console.log(itemId, field, value)
        setFormData((prevData) => {
            // Update the form data with the new value for the specified field
            const updatedItems = prevData.items.map((item) => {
                if (item.id === itemId) {
                    if (field != "quantity") {
                        return {
                            ...item,
                            properties: {
                                ...item.properties,
                                [field]: value,
                            },
                        };
                    } else {
                        return {
                            ...item,
                            [field]: value,

                        };

                    }

                }
                return item;
            });

            // Check for duplicates based on the id before adding a new item
            const newItem = {
                id: itemId,
                quantity: "5",
                properties: {
                    frequency: 'Once Per Day (Anytime)',
                    duration: 'Once Per Day',
                    takeWith: 'Water',
                    notes: '',
                }
            };
            let message = ''
            if (field == "message") {
                return { ...prevData, message: value };
            }

            // Avoid adding the item if it already exists based on the `id`
            if (!updatedItems.some(item => item.id === itemId)) {
                updatedItems.push(newItem);
            }

            return { ...prevData, items: updatedItems, message: message };
        });
    }

    const handleDeselectProduct = (productId) => {
        setSelectedItems((prevSelectedItems) => {
            // Remove the product from selectedItems
            const updatedSelectedItems = prevSelectedItems.filter(item => item?.variants[0]?.id !== productId);
            return updatedSelectedItems;
        });

        setFormData((prevFormData) => {
            // Remove the product from formData
            const updatedFormData = {
                ...prevFormData,
                items: prevFormData.items.filter(item => item.id !== productId),
            };
            return updatedFormData;
        });
    };


    const handleSubmit = async () => {
        console.log(formData, 'formData')
        const invalidItems = formData.items.filter(item => (
            !item.quantity ||
            !item.properties.frequency ||
            !item.properties.duration ||
            !item.properties.takeWith
        ));
        console.log('invalidItems', invalidItems)
        if (invalidItems.length > 0) {
            alert("Please fill out all required fields for each item.");
            return;
        }


        try {
            const response = await fetch('/api/plans/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Failed to submit data');
            Swal.fire({
                title: 'Success!',
                text: 'Plan created successfully!',
                icon: 'success',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const isProductSelected = (productId) => selectedItems.some(item => item.id === productId);
    const breadcrumbItems = [
        { label: 'Plans', href: '/create-plan' },
        { label: 'Create Patient Plan', href: '/create-plan', active: true },
    ];

    return (
        <AppLayout>
            <div className="flex flex-col">
                <div className="mt-8 flex gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-4 rounded-lg bg-white border border-[#AFAAAC] w-full">
                        {/* Patient Info */}
                        <div className="bg-customBg3 p-4 rounded-t-lg flex justify-between items-center">
                            <span className="font-medium text-[19px] text-black">
                                Patient Name: <span className="font-bold">Mary Klein</span>
                            </span>
                        </div>
                        <div className='p-0'>
                            {/* Product Selection */}
                            <div className="p-4">
                                <span className="text-textColor font-medium cursor-pointer">Select Items:</span>
                                <div className="flex space-x-4 mt-2">
                                    {products.map((product, index) => (
                                        <div className='thumbnail-box' key={index}>
                                            {product.image && (
                                                <img
                                                    src={product?.image?.src} // Replace with actual paths
                                                    alt={product.title}
                                                    className={`w-[117px] h-[106px] p-3 ${isProductSelected(product.id) ? 'bg-white shadow-2xl' : 'bg-[#F9F9F9]'} rounded-[8px]`}
                                                    onClick={() => handleSelectProduct(product)}
                                                />
                                            )}
                                            <p className={`font-bold text-base text-center pt-2 ${isProductSelected(product.id) ? 'text-black' : 'text-textColor'}`}>
                                                {product.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Product Info */}
                            {selectedItems.map((item, index) => {
                                const itemData = formData.items.find(fItem => fItem.id === item?.variants[0]?.id);
                                return (<div key={index} className="p-4 border-t border-[#AFAAAC] flex gap-4">
                                    <div className="pr-9 w-full max-w-[400px]">
                                        <img src="/images/product-img1.png" alt="Product" className="w-24 h-24" />
                                        <div>
                                            <h3 className="font-bold text-[18px]">{item.title}</h3>
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
                                                value={itemData?.quantity}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'quantity', e.target.value)}
                                                className="w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            >
                                                <option value="5" selected>Capsules 5 (recommended)</option>
                                                <option value="10">10</option>
                                                <option value="15">15</option>
                                                <option value="20">20</option>
                                            </select>
                                        </div>
                                        <div>
                                            <select
                                                value={itemData?.properties.frequency}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'frequency', e.target.value)}
                                                className="w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            >
                                                <option>Frequency Once Per Day (Anytime)</option>
                                                <option>Twice Per Day</option>
                                                <option>Three Times Per Day</option>
                                            </select>

                                        </div>
                                        <div>
                                            <select
                                                value={itemData?.properties.duration}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'duration', e.target.value)}
                                                className="w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            >
                                                <option>Duration Once Per Day</option>
                                                <option>Twice Per Day</option>
                                            </select>
                                        </div>
                                        <div>
                                            <select
                                                value={itemData?.properties.takeWith}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'takeWith', e.target.value)}
                                                className="w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            >
                                                <option>Take with Water</option>
                                                <option>Juice</option>
                                            </select>
                                        </div>
                                        <div>
                                            <textarea
                                                value={itemData?.properties.notes}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'notes', e.target.value)}
                                                className="w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-4 mt-1 mb-4 resize-none"
                                                rows="4"
                                                placeholder="Add Notes"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>)
                            })
                            }
                            {/* Message Section */}
                            <div className="p-4 border-t border-b border-[#AFAAAC]">
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => handleFormDataChange(0, 'message', e.target.value)}
                                    className="w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-4 mt-1 mb-4 resize-none"
                                    rows="4"
                                    placeholder="Message"
                                ></textarea>
                            </div>
                            {/* Send to Patient Button */}
                            <div className="p-4 text-right">
                                <button className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-inherit min-w-[150px] min-h-[46px] ">
                                    Send to Patient
                                </button>
                            </div>
                        </div>

                    </div>
                    {/* Right Column - Price Summary */}
                    <div className="space-y-4 w-full max-w-[310px]">
                        <div className="bg-white rounded-lg">
                            <div className='p-5 bg-customBg3 rounded-[8px]'>
                                <span className="font-medium text-[#51595B] uppercase">
                                    Price
                                </span>
                                <div className="mt-2 space-y-2">
                                    <div className="flex justify-between">
                                        <span className='text-[#3F4647] text-regular'>Product: L-01</span>
                                        <span className='text-[#3F4647]'>$68.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className='text-[#3F4647] text-regular'>Patient Discount (10%)</span>
                                        <span className='text-[#3F4647]'>-$6.80</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[#AFAAAC] pb-4">
                                        <span className='text-[#3F4647] text-regular'>Subtotal</span>
                                        <span className='text-[#3F4647] font-semibold'>$58.00</span>
                                    </div>
                                </div>
                                <div className='text-right py-5'>
                                    <button className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-white min-w-[150px] min-h-[46px] ">
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
