
'use client'
import AppLayout from 'components/Applayout';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

export default function CreatePlan() {
    const { id } = useParams();
    const { data: session } = useSession();

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

    console.log(products);
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
                quantity: "5",
                properties: {
                    frequency: 'Once Per Day (Anytime)',
                    duration: 'Once Per Day',
                    takeWith: 'Water',
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

            if (!updatedItems.some(item => item.id === itemId)) {
                updatedItems.push(newItem);
            }

            return { ...prevData, items: updatedItems, message: message };
        });
    }

    const handleDeselectProduct = (productId) => {
        setSelectedItems((prevSelectedItems) => {
            const updatedSelectedItems = prevSelectedItems.filter(
                (item) => item.id !== productId
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
                    <div className="lg:col-span-2 space-y-4 rounded-lg bg-white shadow-lg w-full">
                        <div className="bg-customBg3 p-4 rounded-t-lg flex justify-between items-center">
                            {selectedPatient ? (
                                <span className="font-medium text-[19px] text-black">
                                    Patient Name: <span className="font-bold">{`${selectedPatient.firstName} ${selectedPatient.lastName}`}</span>
                                </span>

                            ) : id ? (
                                <p>Loading patient details...</p>
                            ) : (
                                <div>
                                    {patients.length > 0 ? (
                                        <div className='d-flex'>
                                            <span htmlFor="select-patient" className='font-medium text-[19px] text-black'>Select Patient:
                                            </span>
                                            <select
                                                id="select-patient"
                                                className={`w-full bg-inputBg rounded-[8px] p-3 mt-1 mb-42 border-gray-300 rounded focus:outline-none focus:border-blue-500  border-gray-300 rounded focus:outline-none focus:border-blue-500`}

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
                        <div className='p-5'>
                            {/* Product Selection */}
                            <div className="p-4">
                                <span className="text-textColor font-medium cursor-pointer">Select Items:</span>
                                <div className="flex space-x-4 mt-2 items-center">
                                    {selectedItems.map((product, index) => (
                                        <div className='thumbnail-box' key={index}>
                                            <button
                                                onClick={() => { handleDeselectProduct(product.id) }}
                                                className="relative top-1 w-6 h-6 flex items-center justify-center bg-black text-white rounded-full text-sm font-bold"
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
                                            <p className={`font-bold text-base text-center pt-2 ${isProductSelected(product.id) ? 'text-black' : 'text-textColor'}`}>
                                                {product.title}
                                            </p>
                                        </div>
                                    ))}
                                    {/* Plus Button to Add More Products */}
                                    <button
                                        className="w-[50px] h-[50px] bg-[#F9F9F9] rounded-full flex items-center justify-center text-2xl font-bold text-textColor cursor-pointer"
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
                                            <select
                                                value={itemData?.quantity}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'quantity', e.target.value)}
                                                className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            >
                                                <option value="5">Capsules 5 (recommended)</option>
                                                <option value="10">10</option>
                                                <option value="15">15</option>
                                                <option value="20">20</option>
                                            </select>
                                        </div>
                                        <div>
                                            <select
                                                value={itemData?.properties.frequency}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'frequency', e.target.value)}
                                                className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
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
                                                className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            >
                                                <option>Duration Once Per Day</option>
                                                <option>Twice Per Day</option>
                                            </select>
                                        </div>
                                        <div>
                                            <select
                                                value={itemData?.properties.takeWith}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'takeWith', e.target.value)}
                                                className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            >
                                                <option>Take with Water</option>
                                                <option>Juice</option>
                                            </select>
                                        </div>
                                        <div>
                                            <textarea
                                                value={itemData?.properties.notes}
                                                onChange={(e) => handleFormDataChange(item?.variants[0]?.id, 'notes', e.target.value)}
                                                className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-4 mt-1 mb-4 resize-none"
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
                                    className="w-full bg-inputBg min-h-[50px] rounded-[8px] p-4 mt-1 mb-4 resize-none"
                                    rows="4"
                                    placeholder="Message"
                                ></textarea>
                            </div>
                            {/* Send to Patient Button */}
                            <div className="p-4 text-right">
                                <button
                                    onClick={() => { handleSubmit }}
                                    disabled={formData.items.length === 0 || !formData.patient_id}
                                    className={`min-w-[150px] py-2 bg-black text-white font-medium rounded hover:bg-customText focus:outline-none ${formData.items.length === 0 || !formData.patient_id ? 'cursor-not-allowed' : ''}`}
                                >
                                    Send to Patient
                                </button>
                            </div>


                        </div>

                    </div>
                    {/* Right Column - Price Summary */}
                    <div className="space-y-4 w-full max-w-[310px]">
                        <div className="bg-white rounded-lg">
                            <div className="bg-customBg3 p-4 rounded-t-lg flex justify-between items-center">
                                {selectedPatient ? (
                                    <span className="font-medium text-[19px] text-black">
                                        Patient Name: <span className="font-bold">{`${selectedPatient?.firstName} ${selectedPatient?.lastName}`}</span>
                                    </span>
                                ) : (
                                    <span className="font-medium text-[19px] text-gray-500">No Patient Selected</span>
                                )}
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
                                    <button
                                        onClick={() => { handleSubmit }}
                                        disabled={formData.items.length === 0 || !formData.patient_id}
                                        className={`min-w-[150px] py-2 bg-black text-white font-medium rounded hover:bg-customText focus:outline-none ${formData.items.length === 0 || !formData.patient_id ? 'cursor-not-allowed' : ''}`} >
                                        Send to Patient
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                            <h2 className="text-xl font-bold mb-4">Select Product</h2>

                            {/* Search Bar */}
                            <input
                                type="text"
                                placeholder="Search for a product"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full px-4 py-2 mb-4 border rounded-lg"
                            />

                            {/* Product List in Single Line */}
                            <div className="flex overflow-x-scroll space-x-4 h-[180px]">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product, index) => {
                                        const isProductAdded = selectedItems.some(item => item.id === product.id);
                                        return (
                                            <div
                                                key={index}
                                                className={`thumbnail-box cursor-pointer ${isProductAdded ? 'opacity-50 pointer-events-none' : ''}`}  // Disable product selection
                                                onClick={() => !isProductAdded && handleZoomProduct(product)}  // Only allow selection if not already added
                                            >
                                                <img
                                                    src={product.image?.src || '/images/product-img1.png'}
                                                    alt={product.title}
                                                    className="w-[80px] h-[80px] p-3 bg-[#F9F9F9] rounded-[8px]"
                                                />
                                                <p className="font-bold text-base text-center pt-2 text-textColor">
                                                    {product.title}
                                                </p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="ml-36 text-gray-500 mt-14 font-bold">No products found</p>
                                )}

                            </div>

                            {/* Zoomed Product View */}
                            {selectedProduct && (
                                <div className="mt-4">
                                    <h3 className="font-bold text-lg">{selectedProduct.title}</h3>
                                    <img
                                        src={selectedProduct.image?.src || '/images/product-img1.png'}
                                        alt={selectedProduct.title}
                                        className="w-[200px] h-[200px] p-4 bg-[#F9F9F9] rounded-lg ml-32"
                                    />
                                    <h4> Sku  : {selectedProduct?.variants[0]?.sku}</h4>
                                    <h4> Price  : ${selectedProduct?.variants[0]?.price}</h4>

                                    <div className='d-flex absoulte right text-center'>
                                        <button
                                            onClick={() => { handleSelectProduct(selectedProduct), closeModal() }}
                                            className="mt-4  py-2  mr-2 bg-black text-white rounded hover:bg-customText focus:outline-none px-4 py-2 rounded "
                                        >
                                            Add Product
                                        </button>
                                        <button
                                            onClick={closeModal}
                                            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Close Modal Button */}

                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
