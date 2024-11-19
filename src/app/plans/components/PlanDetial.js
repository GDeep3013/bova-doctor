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
    const [variants, setVariants] = useState([]);

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


    const fetchSavedProduct = async () => {
        try {
            const response = await fetch(`/api/products?status=active`);
            if (!response.ok) throw new Error('Failed to fetch product status');

            const data = await response.json();

            // Check if the data has products and then map and push variant IDs into an array
            if (Array.isArray(data) && data.length > 0) {
                const variantIds = data.map(product => product.variant_id); // Adjust 'variantId' according to your data structure
                getVariants(variantIds)
            } else {
                console.log('No products found or data is empty');
            }
        } catch (error) {
            console.error('Error fetching product status:', error);
        }
    };

    const getVariants = async (variantIds) => {
        try {
            const response = await fetch(`/api/shopify/products/variants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variantIds: variantIds }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }
            const data = await response.json();
            const variants = Object.values(data.data).map(variant => ({
                id: parseInt(variant.id.replace('gid://shopify/ProductVariant/', '')),
                title: variant.title,
                price: parseFloat(variant.price),
                sku: variant.sku,
                image: variant.image ? {
                    id: parseInt(variant.image.id.replace('gid://shopify/ProductImage/', '')),
                    url: variant.image.url,
                    altText: variant.image.altText
                } : null,
                product: {
                    id: parseInt(variant.product.id.replace('gid://shopify/Product/', '')),
                    title: variant.product.title,
                    descriptionHtml: variant.product.descriptionHtml,
                    images: variant.product.images.edges.map(edge => ({
                        id: parseInt(edge.node.id.replace('gid://shopify/ProductImage/', '')),
                        url: edge.node.url,
                        altText: edge.node.altText
                    }))
                }
            }));
            setVariants(variants);
        } catch (error) {
            console.error("Error updating product status:", error);
        }
    };
    useEffect(() => {
        // fetchProducts();
        fetchPatients();
        fetchSavedProduct()
    }, []);


    const handleSelectProduct = (variant) => {
        setSelectedItems((prevSelectedItems) => {
            const productExists = prevSelectedItems.some((item) => item.id === variant.id);
            if (productExists) return prevSelectedItems;
            return [...prevSelectedItems, variant];
        });
        setFormData((prevData) => {
            const updatedItems = prevData.items
            const newItem = {
                id: variant.id,
                price: variant.price,
                title: variant.product?.title,
                quantity: 5,
                properties: {
                    frequency: 'Once Per Day (Anytime)',
                    duration: 'Monthly (Recommended),',
                    takeWith: 'Water',
                    _patient_id: selectedPatient?.id || id,
                    notes: '',
                }
            };
            if (!updatedItems.some(item => item.id === variant?.id)) {
                updatedItems.push(newItem);
            }
            return { ...prevData, items: updatedItems };
        });
    };



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
                    const matchingProduct = variants.find(item => item.id === mappedItem.id);
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
    }, [id, variants, patients]);


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
            <h1 className="text-2xl pt-4 md:pt-1 mb-1">View Patient Plan</h1>
            <button className="text-gray-600 text-sm mb-4 text-left" onClick={()=>{router.back()} }>&lt; Back</button>
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
                            const itemData = formData.items.find(fItem => fItem.id === item.id);
                            return (<div key={index} className="p-4 border-t border-[#AFAAAC] flex max-[1200px]:flex-wrap gap-4">
                               <div className="pr-5 xl:pr-9 w-full min-[1201px]:max-w-[400px]">
                                    <img
                                        src={
                                            item.image && item.image.url
                                                ? item.image.url
                                                : (item.product.images && item.product.images[0] && item.product.images[0].url)
                                                    ? item.product.images[0].url
                                                    : '/images/product-img1.png'
                                        }
                                        alt="Product"
                                        className="w-24 h-24" />
                                    <div>
                                        <h3 className="font-bold text-base xl:text-[18px]">{(item.title !="Default Title")?item.title:item.product.title }</h3>
                                        <p className="text-textColor mt-2 text-base max-w-[200px]">
                                        {item?.product?.descriptionHtml
                                                    ? new DOMParser().parseFromString(item.product.descriptionHtml, 'text/html').body.textContent
                                                    : ''}
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
                                            className="w-full border border-[#AFAAAC] outline-none min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            placeholder="Enter Quantity (e.g., 5, 10)"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            readOnly
                                            value={itemData?.properties.frequency ?? ""}
                                            className="w-full border border-[#AFAAAC] outline-none min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            placeholder="Enter Frequency (e.g., Once Per Day)"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            readOnly
                                            value={itemData?.properties.duration ?? ""}
                                            className="w-full border border-[#AFAAAC] outline-none min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            placeholder="Enter Duration (e.g., Once Per Day)"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            readOnly
                                            value={itemData?.properties.takeWith ?? ""}
                                            className="w-full border border-[#AFAAAC] outline-none min-h-[50px] rounded-[8px] p-2 mt-1 mb-4"
                                            placeholder="Enter Take With (e.g., Water)"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            readOnly
                                            value={itemData?.properties.notes ?? ""}
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
