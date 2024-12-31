'use client'
import AppLayout from 'components/Applayout';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Loader from 'components/loader';
export default function CreatePlan() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({ items: [], message: '', patient_id: null, mail_data: [], discount: "" });
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [variants, setVariants] = useState([]);
    const [fetchLoader, setfetchLoader] = useState(false);
    const [planStatus, setPlanStatus] = useState('');

    const [dicountPrice, setDicountPrice] = useState(0);
    const [doctorCommission, setDoctorCommission] = useState(0)
    const DISCOUNT_CODE_PERCENTAGE = [
        { label: "Select discount", value: "" },
        { label: "5% OFF", value: "5" },
        { label: "10% OFF", value: "10" },
        { label: "15% OFF", value: "15" },
        { label: "20% OFF", value: "20" },
        { label: "25% OFF", value: "25" },
        { label: "30% OFF", value: "30" },
        { label: "35% OFF", value: "35" },
        { label: "40% OFF", value: "40" },
        { label: "45% OFF", value: "45" },
        { label: "50% OFF", value: "50" },
    ];
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
            const response = await fetch(`/api/products`);
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
        setfetchLoader(true)
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
                quantity: 1,
                properties: {
                    capsule: 1,
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
            // console.log(data?.status);
            if (response.ok) {
                const mappedItems = data.items.map(item => ({
                    id: item.id,
                    quantity: 1,
                    price: item.price,
                    title: item.title,
                    image: item?.image,
                    description: item?.description,
                    properties: {
                        capsule: item.properties.capsule || 1,
                        frequency: item.properties.frequency || 'Once Per Day (Anytime)',
                        duration: item.properties.duration || 'Once Per Day',
                        takeWith: item.properties.takeWith || 'Water',
                        _patient_id: item.properties._patient_id || '',
                        notes: item.properties.notes || ''
                    }
                }));
                setPlanStatus(data?.status);
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
                const mappedMailData = data.items.map(item => ({
                    image: item.properties?.image || null, // Ensure the image is present in properties or set as null
                    description: item.properties?.description || '' // Ensure description is present in properties or set as empty string
                }));
                setFormData(prevData => ({
                    ...prevData,
                    items: mappedItems,
                    discount: data.discount ? data.discount : "",
                    mailData: mappedMailData,
                    message: data?.message
                }));
                setfetchLoader(false)
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to fetch Plan data.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: "#3c96b5",

                });
                setfetchLoader(false)

            }
        } catch (error) {
            console.error("Error fetching plan data:", error);
            Swal.fire({
                title: 'Error!',
                text: 'An error occurred while fetching plan data.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: "#3c96b5",
            });
            setfetchLoader(false)
        }
    };

    useEffect(() => {
        fetchPlanData();
    }, [id, variants, patients]);

    const subtotal = formData.items.reduce((acc, item) => {
        return acc + (parseFloat(item.price) || 0);  // Ensure item.price is treated as a float
    }, 0);


    // const discount = subtotal * parseFloat(formData.discount);

    const commissionPercentage = session?.userDetail?.commissionPercentage || 0;

    // const doctorCommission = subtotal * (commissionPercentage / 100);
    useEffect(() => {
        if (subtotal > 0 && parseFloat(commissionPercentage) > 0) {
            const discountValue = formData.discount === "" ? 0 : parseFloat(formData.discount);

            const discount = (subtotal * discountValue) / 100;
            const doctorPrice = (subtotal * parseFloat(commissionPercentage)) / 100 - discount;

            setDicountPrice(discount);
            setDoctorCommission(doctorPrice);
        }
    }, [formData.discount, commissionPercentage, subtotal]);
    return (
        <AppLayout>
            {!fetchLoader ?
                <div className="flex flex-col">
                    <h1 className="text-2xl pt-4 md:pt-1 mb-1">View Patient Plan</h1>
                    <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>
                    <div className="mt-4 md:mt-8 flex max-[767px]:flex-wrap gap-8">
                        <div className="lg:col-span-2 space-y-4 rounded-lg bg-white border border-[#AFAAAC] w-full">
                            <div className="bg-customBg3 p-2 xl:px-8 xl:py-5 rounded-t-lg">
                                {selectedPatient ? (
                                    <span className="font-medium text-base xl:text-[19px] text-black">
                                        Patient Name: <span className="font-medium">{`${selectedPatient.firstName} ${selectedPatient.lastName}`}</span>
                                    </span>

                                ) : id ? (
                                    <p>Loading patient details...</p>
                                ) : (
                                    <div>
                                        {patients.length > 0 ? (
                                            <div className='flex justify-between w-full items-center'>
                                                <select
                                                    id="select-patient"
                                                    className={`select-patient border border-customBg2 bg-customBg2 text-sm rounded-[8px] text-white min-w-[170px] p-2 xl:p-3 mt-1 mb-42 border-gray-300 rounded focus:outline-none focus:border-blue-500  border-gray-300 rounded focus:outline-none focus:border-blue-500`}

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
                                                    <span className="font-medium text-base xl:text-[19px] text-black">
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


                                {/* Product Info */}
                                {selectedItems.map((item, index) => {
                                    const itemData = formData.items.find(fItem => fItem.id === item.id);
                                    return (<div key={index}
                                        className={`p-8 ${index === 0 ? "" : "border-t border-[#AFAAAC]"} flex max-[1200px]:flex-wrap gap-4`}

                                    >
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
                                                <h3 className="font-bold text-[#53595B] mt-2 text-base xl:text-[18px]">{(item.title != "Default Title") ? item.title : item.product.title}</h3>
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
                                                    value={itemData?.properties.capsule ?? ""}
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
                                {selectedItems.length > 0 && <div className="p-8 pb-4 border-t border-[#AFAAAC]">
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData((prevFormData) => ({ ...prevFormData, message: e.target.value, }))}
                                        className="w-full border border-customBorder rounded-md focus:outline-none min-h-[50px] rounded-[8px] p-4 mt-1 mb-4 resize-none  text-[#52595b] text-base xl:text-lg"
                                        rows="4"
                                        readOnly
                                        placeholder="Message"
                                    ></textarea>
                                </div>}
                            </div>
                        </div>
                        {/* Right Column - Price Summary */}
                        <div className="space-y-4 w-full max-w-[100%] md:max-w-[310px]">
                            <div className='border border-customBorder p-5 rounded-lg'>
                                <div class="form-floating">
                                    <label for="floatingSelect" className='font-semibold text-base text-textColor3 block'>Select Patient Discount</label>
                                    <select
                                        disabled={true}
                                        value={formData.discount}
                                        onChange={(e) => {
                                            setFormData((prevData) => ({
                                                ...prevData,
                                                discount: e.target.value,
                                            }));
                                        }}
                                        class="form-select border border-customBorder block w-full max-w-[175px] font-medium p-3 mt-2 text-base border-gray-300 focus:outline-none focus:ring-[#3c637a] focus:border-[#3c637a] text-[#52595b] text-md rounded-md" id="floatingSelect" aria-label="Floating label select example">
                                        {DISCOUNT_CODE_PERCENTAGE.filter(discount => {
                                            const discountValue = parseFloat(discount.value);
                                            return (
                                                isNaN(discountValue) ||
                                                discountValue <= commissionPercentage
                                            );
                                        }).map((discount, index) => (
                                            <option key={index} value={discount.value}>
                                                {discount.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="bg-customBg3 rounded-lg">

                                <div className='p-5'>
                                    <span className="font-medium text-base text-[#51595B] uppercase">Price</span>
                                    <table className="min-w-full table-auto">
                                        <tbody>
                                            {formData.items.map((item, index) => (
                                                <tr key={index} className="">
                                                    <td className="py-2 text-textColor3 text-sm">
                                                        {item.title}
                                                    </td>
                                                    <td className="py-2 text-textColor3 text-sm text-center w-[43%]"> </td>
                                                    <td className="py-2 text-textColor3 text-sm text-right">
                                                        ${(item.price)}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="">
                                                <td className="py-2 text-textColor3 text-sm" colSpan="2">Patient Discount ({formData.discount ? formData.discount : 0}%)</td>
                                                <td className="py-2 text-textColor3 text-sm text-right">-${dicountPrice.toFixed(2)}</td>
                                            </tr>
                                            <tr className="">
                                                <td className="py-2 text-textColor3 text-sm" colSpan="2">Doctor commission</td>
                                                <td className="py-2 text-textColor3 text-sm text-right">${doctorCommission.toFixed(2)}</td>
                                            </tr>
                                            <tr className="border-b border-[#AFAAAC] pb-4">
                                                <td className="py-2 text-textColor3 text-sm" colSpan="2">Subtotal</td>
                                                <td className="py-2 font-bold text-[#53595B]  text-right">
                                                    ${(subtotal - dicountPrice).toFixed(2)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    {planStatus != 'ordered' &&
                                        <div className='text-right py-5'>
                                            <button
                                                onClick={() => { router.push(`/plans/edit-plan/${id}`); }}
                                                // disabled={formData.items.length === 0 || !formData.patient_id}
                                                className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-white min-w-[150px] min-h-[46px] ">
                                                Edit Patient Plan
                                            </button>
                                        </div>}
                                </div>
                            </div>
                        </div>
                    </div>

                </div >
                : <Loader />
            }
        </AppLayout >
    )
}
