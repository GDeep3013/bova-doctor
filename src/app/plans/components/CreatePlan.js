
'use client'
import AppLayout from 'components/Applayout';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { CloseIcon } from '../../../components/svg-icons/icons';

export default function CreatePlan() {
    const { id } = useParams();
    const { data: session } = useSession();
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({ items: [], message: '', patient_id: null });
    const [selectedProduct, setSelectedProduct] = useState(null);
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
                title: product?.title,
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



    const handleDeselectProduct = (productId) => {
        setSelectedItems((prevSelectedItems) => {
            const updatedSelectedItems = prevSelectedItems.filter(
                (item) => item?.variants[0]?.id !== productId
            );
            return updatedSelectedItems;
        });
        setFormData((prevFormData) => {
            const updatedItems = prevFormData.items.filter(
                (item) => item.id !== productId
            );
            return {
                ...prevFormData,
                items: updatedItems,
            };
        });
    };



    const handleSubmit = async () => {
        const invalidItems = formData.items.filter(item => (
            !item.quantity ||
            !item.properties.frequency ||
            !item.properties.duration ||
            !item.properties.takeWith
        ));
        if (invalidItems.length > 0) {
            alert("Please fill out all required fields for each item.");
            return;
        }
        try {
            Swal.fire({
                title: 'Sending...',
                html: 'Please wait while we send the email.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
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
            router.push('/plans/review');

        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const isProductSelected = (productId) => selectedItems.some(item => item.id === productId);
    const breadcrumbItems = [
        { label: 'Plans', href: '/create-plan' },
        { label: 'Create Patient Plan', href: '/create-plan', active: true },
    ];

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handleZoomProduct = (product) => setSelectedProduct(product);
    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm)
    )

    const handleSearchChange = (event) => setSearchTerm(event.target.value.toLowerCase());


    useEffect(() => {
        if (id) {
            const matchedPatient = patients.find(patient => patient._id === id);
            if (matchedPatient) {
                setSelectedPatient(matchedPatient);
                setFormData((prevData) => ({
                    ...prevData,
                    patient_id: matchedPatient._id,
                }));
            }
        }
    }, [id, patients]);

    const handleSelectPatient = (e) => {
        const selectedId = e.target.value;
        const selected = patients.find((patient) => patient._id === selectedId);
        setSelectedPatient(selected);
        setFormData((prevData) => ({
            ...prevData,
            patient_id: selectedId,
        }));
    }

    const subtotal = formData.items.reduce((acc, item) => {
        const itemQuantity = item.quantity || 1;
        return acc + itemQuantity * item.price;
    }, 0);

    // Calculate 10% discount
    const discount = subtotal * 0.1;

    return (
        <AppLayout>
            <div className="flex flex-col">
                <h1 className="text-2xl mb-1">Create Patient Plan</h1>
                <button className="text-gray-600 text-sm mb-4 text-left">&lt; Back</button>
                <div className="mt-8 flex gap-8">
                    <div className="lg:col-span-2 space-y-4 rounded-lg bg-white border border-[#AFAAAC] w-full">
                        <div className="bg-customBg3 p-4 rounded-t-lg">
                            {selectedPatient ? (
                                <span className="font-medium text-[19px] text-black">
                                    Patient Name: <span className="font-bold">{`${selectedPatient.firstName} ${selectedPatient.lastName}`}</span>
                                </span>

                            ) : id ? (
                                <p>Loading patient details...</p>
                            ) : (
                                <div>
                                    {patients.length > 0 ? (
                                        <div className='flex justify-between w-full items-center'>
                                            <span htmlFor="select-patient" className='font-medium w-full text-[19px] text-black'>Select Patient:
                                            </span>
                                            <select
                                                id="select-patient"
                                                className={`w-full bg-inputBg rounded-[8px] max-w-[250px] p-3 mt-1 mb-42 border-gray-300 rounded focus:outline-none focus:border-blue-500  border-gray-300 rounded focus:outline-none focus:border-blue-500`}

                                                onChange={handleSelectPatient}
                                                value={selectedPatient?.id || ""}
                                            >
                                                <option value="">Select a patient</option>
                                                {patients.map((patient) => (
                                                    <option key={patient._id} value={patient._id}>
                                                        {patient.firstName} {patient.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                            {selectedPatient && (
                                                <span className="font-medium text-[19px] text-black">
                                                    Patient Name: <span className="font-bold">{`${selectedPatient.firstName} ${selectedPatient.lastName}`}</span>
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <p>No patients available</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className='p-0'>
                            {/* Product Selection */}
                            <div className="p-4">
                                <span className="text-textColor font-medium cursor-pointer">Select Items:</span>
                                <div className="flex space-x-6 mt-2">
                                    {selectedItems.map((product, index) => (
                                        <div className='thumbnail-box relative max-w-[120px]' key={index}>
                                            <button
                                                onClick={() => { handleDeselectProduct(product?.variants[0]?.id) }}
                                                className="top-0 absolute right-0 w-6 h-6 flex items-center justify-center bg-black text-white rounded-full text-sm font-bold"
                                                aria-label="Deselect Product"
                                            >
                                                &times;
                                            </button>
                                            {product.image && (
                                                <img
                                                    src={product.image.src} // Replace with actual paths
                                                    alt={product.title}
                                                    className={`w-[117px] h-[106px] p-3 ${isProductSelected(product.id) ? 'bg-white shadow-2xl' : 'bg-[#F9F9F9]'} rounded-[8px]`}
                                                    onClick={() => handleSelectProduct(product)}
                                                />
                                            )}
                                            <p className={`font-bold text-[12px] text-center pt-2 ${isProductSelected(product.id) ? 'text-black' : 'text-textColor'}`}>
                                                {product.title}
                                            </p>
                                        </div>
                                    ))}
                                    {/* Plus Button to Add More Products */}
                                    <button
                                        className=" h-[106px] max-w-[120px] w-full bg-white flex items-center justify-center text-2xl font-bold text-textColor cursor-pointer shadow-2xl rounded-[8px]"
                                        onClick={openModal}
                                    >
                                        +
                                    </button>
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
                                            <input
                                                type="number"
                                                value={itemData?.quantity ?? ""}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'quantity', e.target.value)}
                                                className="w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                                placeholder="Enter Quantity (e.g., 5, 10)"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={itemData?.properties.frequency ?? ""}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'frequency', e.target.value)}
                                                className="w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                                placeholder="Enter Frequency (e.g., Once Per Day)"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={itemData?.properties.duration ?? ""}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'duration', e.target.value)}
                                                className="w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                                placeholder="Enter Duration (e.g., Once Per Day)"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={itemData?.properties.takeWith ?? ""}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'takeWith', e.target.value)}
                                                className="w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                                placeholder="Enter Take With (e.g., Water)"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={itemData?.properties.notes ?? ""}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'notes', e.target.value)}
                                                className="w-full border border-[#AFAAAC] focus:border-[#25464f] min-h-[50px] rounded-[8px] p-4 mt-1 mb-4"
                                                placeholder="Add Notes"
                                            />
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
                                <button
                                    onClick={() => { handleSubmit() }}
                                    disabled={formData.items.length === 0 || !formData.patient_id}
                                    className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-inherit min-w-[150px] min-h-[46px] ">
                                    Send to Patient
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Right Column - Price Summary */}
                    <div className="space-y-4 w-full max-w-[310px]">
                        <div className="bg-white rounded-lg">
                            <div className="bg-customBg3 p-4 rounded-t-lg flex justify-between items-center">
                                <span className="font-medium text-[19px] text-black">
                                    Price
                                </span>
                            </div>
                            <div className='p-5'>
                                <div className="mt-2 space-y-2">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex justify-between">
                                            <span className='text-[#3F4647] text-regular' >
                                                Product   {item.title}: {item.quantity ? item.quantity : 1} x {item.price}
                                            </span>
                                            <span className='text-[#3F4647]'>
                                                ${((item.quantity ? item.quantity : 1) * item.price).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between mt-2">
                                        <span className='text-[#3F4647] text-regular'>Patient Discount (10%)</span>
                                        -${discount.toFixed(2)}
                                    </div>
                                    <div className="flex justify-between border-b border-[#AFAAAC] pb-4 mt-2">
                                        <span className='text-[#3F4647] text-regular'>Subtotal</span>
                                        <span className='text-[#3F4647] font-semibold'>
                                            ${(subtotal - discount).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <div className='text-right py-5'>
                                    <button
                                        onClick={() => { handleSubmit() }}
                                        disabled={formData.items.length === 0 || !formData.patient_id}
                                        className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-white min-w-[150px] min-h-[46px]">
                                        Send to Patient
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg max-w-[1020px] w-full">
                            <div className='flex justify-between items-center py-4'>
                                <h2 className="text-xl font-bold">Select Product</h2>
                                <button onClick={closeModal}> <CloseIcon /> </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Search for a product"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full px-4 py-2 mb-4 border rounded-lg"
                            />

                            {/* Product List in Single Line */}
                            <div className="flex space-x-4 h-[600px] overflow-y-auto">
                                {filteredProducts.length > 0 ? (
                                    <div className="mt-4">
                                        <table className="min-w-full bg-white">
                                            <thead>
                                                <tr>
                                                    <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase">Image</th>
                                                    <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase">Title</th>
                                                    <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase">SKU</th>
                                                    <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase">Price</th>
                                                    <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredProducts.map((product, index) => {
                                                    const isProductAdded = selectedItems.some(item => item.id === product.id);
                                                    return (
                                                        <tr
                                                            key={index}
                                                            className={`border-b hover:bg-gray-50 ${isProductAdded ? 'opacity-50 pointer-events-none' : ''}`} // Disable product selection if already added
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <img
                                                                    src={product.image?.src || '/images/product-img1.png'}
                                                                    alt={product.title}
                                                                    className="w-[80px] h-[80px] p-2 bg-[#F9F9F9] rounded-lg"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">{product.title}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{product?.variants[0]?.sku || 'N/A'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">${product?.variants[0]?.price || 'N/A'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <button
                                                                    onClick={() => { handleSelectProduct(product) }}
                                                                    className="bg-customBg2 border border-customBg2 text-white px-4 py-2 rounded hover:bg-white hover:text-customBg2 disabled:opacity-50"
                                                                    disabled={isProductAdded}
                                                                >
                                                                    {isProductAdded ? 'Added' : 'Add'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="ml-36 text-gray-500 mt-14 font-bold">No products found</p>
                                )}

                            </div>


                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
