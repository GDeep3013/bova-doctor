'use client'
import AppLayout from 'components/Applayout';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import {useRouter, useParams } from 'next/navigation';

export default function CreatePlan() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({ items: [], message: '', patient_id: null });
    const [selectedPatient, setSelectedPatient] = useState(null);

    const fetchPatients = async () => {
        try {
            const response = await fetch(`/api/patients/getPatients?userId=${session?.user?.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch patients");
            }
            const data = await response.json();
            setPatients(data);
        } catch (error) {
            setError(error.message);
        }
    }


    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/shopify/products');
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    useEffect(() => {
        fetchProducts();
        fetchPatients();
    }, []);


    const handleSelectProduct = (product) => {
        setSelectedItems((prevSelectedItems) => {
            const productExists = prevSelectedItems.some((item) => item.id === product.id);
            if (productExists) return prevSelectedItems;
            return [...prevSelectedItems, product];
        });
        setFormData((prevData) => {
            const updatedItems = prevData.items
            const newItem = {
                id: product.variants[0]?.id,
                price: product.variants[0]?.price,
                title : product?.title,
                quantity: 1,
                properties: {
                    frequency: 'Once Per Day (Anytime)',
                    duration: 'Once Per Day',
                    takeWith: 'Water',
                    _patient_id: selectedPatient?.id || id,
                    notes: '',
                }
            };
            if (!updatedItems.some(item => item.id === product.variants[0]?.id)) {
                updatedItems.push(newItem);
            }
            return { ...prevData, items: updatedItems };
        });
    };


    function handleFormDataChange(itemId, field, value) {
        setFormData((prevData) => {
            const updatedItems = prevData.items.map((item) => {
                if (item.id === itemId) {
                    // Check if the field is 'quantity' or needs updating in 'properties'
                    if (field === "quantity") {
                        return {
                            ...item,
                            quantity: parseInt(value, 10),
                        };
                    } else if (field === "price" || field === "title") {
                        // Update price or title if those are the fields being changed
                        return {
                            ...item,
                            [field]: value,
                        };
                    } else {
                        // Update other properties
                        return {
                            ...item,
                            properties: {
                                ...item.properties,
                                [field]: value,
                                _patient_id: selectedPatient?.id || id, // Ensure _patient_id is added here
                            },
                        };
                    }
                }
                return item;
            });
            return { ...prevData, items: updatedItems };
        });
    }
        const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm)
    )


    const fetchPlanData = async () => {
        try {
            const response = await fetch(`/api/plans/edit/${id}`);
            const data = await response.json();
            if (response.ok) {
                const mappedItems = data.items.map(item => ({
                    id: item.id,
                    quantity: item.quantity || 1,
                    price: item.price,
                    title : item.title,
                    properties: {
                        frequency: item.properties.frequency || 'Once Per Day (Anytime)',
                        duration: item.properties.duration || 'Once Per Day',
                        takeWith: item.properties.takeWith || 'Water',
                        _patient_id: item.properties._patient_id || '',
                        notes: item.properties.notes || ''
                    }
                }));
                mappedItems.forEach(mappedItem => {
                    const matchingProduct = filteredProducts.find(item => item?.variants[0]?.id === mappedItem.id);
                    if (matchingProduct) {
                        handleSelectProduct(matchingProduct);
                    }
                });
                const matchedPatient = patients.find(patient => patient._id === data?.patient_id?._id);
                if (matchedPatient) {
                    setSelectedPatient(matchedPatient);
                    setFormData((prevData) => ({
                        ...prevData,
                        patient_id: matchedPatient._id,
                    }));
                }
                setFormData(prevData => ({ ...prevData, items: mappedItems, message: data?.message }))
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to fetch Plan data.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });

            }
        } catch (error) {
            console.error("Error fetching plan data:", error);
            Swal.fire({
                title: 'Error!',
                text: 'An error occurred while fetching plan data.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    useEffect(() => {
        fetchPlanData();
    }, [id, products, patients]);


    const subtotal = formData.items.reduce((acc, item) => {
        const itemQuantity = item.quantity || 1;
        return acc + itemQuantity * item.price;
    }, 0);

    const discount = subtotal * 0;
    const commissionPercentage = session?.userDetail?.commissionPercentage || 0;
    const doctorCommission = subtotal * (commissionPercentage / 100);    
    return (
        <AppLayout>
        <div className="flex flex-col">
            <h1 className="text-2xl pt-4 md:pt-1 mb-1">Edit Patient Plan</h1>
            <button className="text-gray-600 text-sm mb-4 text-left">&lt; Back</button>
            <div className="mt-4 md:mt-8 flex max-[767px]:flex-wrap gap-8">
                <div className="lg:col-span-2 space-y-4 rounded-lg bg-white border border-[#AFAAAC] w-full">
                    <div className="bg-customBg3 p-2 md:p-4 rounded-t-lg">
                            <span className="font-medium text-[19px] text-black">
                                Patient Name: <span className="font-medium">{`${selectedPatient?.firstName} ${selectedPatient?.lastName}`}</span>
                            </span>
                        </div>
                    <div className='p-0'>


                        {/* Product Info */}
                        {selectedItems.map((item, index) => {
                            const itemData = formData.items.find(fItem => fItem.id === item?.variants[0]?.id);
                            return (<div key={index} className="p-4 border-t border-[#AFAAAC] flex max-[767px]:flex-wrap gap-4">
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
                                        <input
                                            type="number"
                                            readOnly
                                            value={itemData?.quantity ?? ""}
                                            onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'quantity', e.target.value)}
                                            className="w-full border border-[#AFAAAC] outline-none min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            placeholder="Enter Quantity (e.g., 5, 10)"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            readOnly
                                            value={itemData?.properties.frequency ?? ""}
                                            onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'frequency', e.target.value)}
                                            className="w-full border border-[#AFAAAC] outline-none min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            placeholder="Enter Frequency (e.g., Once Per Day)"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            readOnly
                                            value={itemData?.properties.duration ?? ""}
                                            onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'duration', e.target.value)}
                                            className="w-full border border-[#AFAAAC] outline-none min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            placeholder="Enter Duration (e.g., Once Per Day)"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            readOnly
                                            value={itemData?.properties.takeWith ?? ""}
                                            onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'takeWith', e.target.value)}
                                            className="w-full border border-[#AFAAAC] outline-none min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            placeholder="Enter Take With (e.g., Water)"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            readOnly
                                            value={itemData?.properties.notes ?? ""}
                                            onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'notes', e.target.value)}
                                            className="w-full border border-[#AFAAAC] outline-none min-h-[50px] rounded-[8px] p-4 mt-1 mb-4"
                                            placeholder="Add Notes"
                                        />
                                    </div>
                                </div>
                            </div>)
                        })
                        }
                         <div className="p-4 border-t border-b border-[#AFAAAC]">
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData((prevFormData) => ({ ...prevFormData, message: e.target.value, })) }
                                    className="w-full border outline-none border-[#AFAAAC] min-h-[50px] rounded-[8px] p-4 mt-1 mb-4 resize-none"
                                    rows="4"
                                    readOnly
                                    placeholder="Message"
                                ></textarea>
                            </div>
                    </div>
                </div>
                {/* Right Column - Price Summary */}
                <div className="space-y-4 w-full max-w-[100%] md:max-w-[310px]">
                    <div className="bg-customBg3 rounded-lg">

                        <div className='p-5'>
                            <span className="font-medium text-base text-[#51595B] uppercase">Price</span>
                            <table className="min-w-full table-auto">

                                        <tbody>
                                            {formData.items.map((item, index) => (
                                                <tr key={index} className="">
                                                    <td className="py-2 text-[#3F4647] text-sm">
                                                        {item.title}
                                                    </td>
                                                    <td className="py-2 text-[#3F4647] text-sm text-center w-[43%]"> {item.quantity ? item.quantity : 1} x {item.price}</td>
                                                    <td className="py-2 text-[#3F4647] text-sm text-right">
                                                        ${((item.quantity ? item.quantity : 1) * item.price).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="">
                                                <td className="py-2 text-[#3F4647] text-sm" colSpan="2">Patient Discount (0%)</td>
                                                <td className="py-2 text-[#3F4647] text-sm text-right">-${discount.toFixed(2)}</td>
                                        </tr>
                                        <tr className="">
                                                <td className="py-2 text-[#3F4647] text-sm" colSpan="2">Doctor commission</td>
                                                <td className="py-2 text-[#3F4647] text-sm text-right">${doctorCommission.toFixed(2)}</td>
                                            </tr>
                                            <tr className="border-b border-[#AFAAAC] pb-4">
                                                <td className="py-2 text-[#3F4647] text-sm" colSpan="2">Subtotal</td>
                                                <td className="py-2 text-[#51595B] font-semibold text-right">
                                                    ${(subtotal - discount).toFixed(2)}
                                                </td>
                                        </tr>
                                        
                                        </tbody>
                                    </table>
                            <div className='text-right py-5'>
                                <button
                                    onClick={() => { router.push(`/plans/edit-plan/${id}`);}}
                                    // disabled={formData.items.length === 0 || !formData.patient_id}
                                    className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-white min-w-[150px] min-h-[46px] ">
                                    Edit to Patient Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div >
    </AppLayout >
    )
}
