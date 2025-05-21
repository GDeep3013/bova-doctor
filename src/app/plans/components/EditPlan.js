
'use client'
import AppLayout from 'components/Applayout';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { CloseIcon } from '../../../components/svg-icons/icons';
import Loader from 'components/loader';
export default function CreatePlan() {
    const { id } = useParams();
    const { data: session } = useSession();
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({ items: [], message: '', patient_id: null, mail_data: [], discount: "" });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loader, setLoader] = useState(false);
    const [fetchLoader, setFetchLoader] = useState(false);

    const [dicountPrice, setDicountPrice] = useState(0);
    const [doctorCommission, setDoctorCommission] = useState(0)

    const [variants, setVariants] = useState([]);
    const [allVariants, setAllVariants] = useState([]);
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

    console.log('selectedPatient',selectedPatient)
    const commissionPercentage = session?.userDetail?.commissionPercentage || 0;
    const fetchPatients = async () => {

        try {
            const response = await fetch(`/api/patients/getPatients?userId=${session?.user?.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch patients");
            }
            const data = await response.json();
            setPatients(data);
            // setFetchLoader(false)
        } catch (error) {
            setError(error.message);
            // setFetchLoader(false)
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
                getVariants(variantIds, 'active');
                // setLoader(false)
            } else {
                console.log('No products found or data is empty');
                // setLoader(false)
            }
        } catch (error) {
            console.error('Error fetching product status:', error);
            // setLoader(false)
        }
    };
    const fetchAllProduct = async () => {
        try {
            const response = await fetch(`/api/products`);
            if (!response.ok) throw new Error('Failed to fetch product status');
            const data = await response.json();
            // Check if the data has products and then map and push variant IDs into an array
            if (Array.isArray(data) && data.length > 0) {
                const variantIds = data.map(product => product.variant_id); // Adjust 'variantId' according to your data structure
                getVariants(variantIds, 'All')
                // setLoader(false)
            } else {
                console.log('No products found or data is empty');
                // setLoader(false)
            }
        } catch (error) {
            console.error('Error fetching product status:', error);
            // setLoader(false)
        }
    };

    const getVariants = async (variantIds, type) => {
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
            if (type === 'All') {
                setAllVariants(variants)
            }
            if (type === 'active') {
                setVariants(variants)
            }
        } catch (error) {
            console.error("Error updating product status:", error);
        }
    };

    useEffect(() => {
        fetchAllProduct()
        setFetchLoader(true);
        fetchPatients();
        fetchSavedProduct()
        // setFetchLoader(false);
    }, []);



    const handleSelectProduct = (variant) => {

        setSelectedItems((prevSelectedItems) => {
            const productExists = prevSelectedItems.some((item) => item.id === variant.id);
            if (productExists) return prevSelectedItems;
            return [...prevSelectedItems, variant];
        });

        setFormData((prevData) => {
            // Extract items and mailData from the previous state
            const updatedItems = [...prevData.items];
            const updatedMailData = [...prevData.mail_data];

            // New item to be added to 'items'
            const newItem = {
                id: variant.id,
                price: variant.price,
                title: variant.product?.title,
                quantity: 5,
                image: variant?.product?.images[0]?.url,
                description: variant?.product?.descriptionHtml,
                properties: {
                    capsule: 5,
                    frequency: 'Once Per Day (Anytime)',
                    duration: 'Monthly (Recommended)',
                    takeWith: 'Water',
                    _patient_id: selectedPatient?._id || id,
                    notes: '',
                }
            };

            // New mailData item
            const newMailData = {
                image: variant.product?.images?.[0]?.url || null,
                description: variant.product?.descriptionHtml || ''
            };

            if (!updatedItems.some(item => item.id === variant.id)) {
                updatedItems.push(newItem);
            }

            // Add new mailData if not already present
            if (!updatedMailData.some(data => data.image === newMailData.image)) {
                updatedMailData.push(newMailData);
            }

            // Return updated state
            return { ...prevData, items: updatedItems, mail_data: updatedMailData };
        });
    };

    function handleFormDataChange(itemId, field, value) {
        setFormData((prevData) => {
            const updatedItems = prevData.items.map((item) => {
                if (item.id === itemId) {
                    // Check if the field is 'quantity' or needs updating in 'properties'
                    if (field === "price" || field === "title") {
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
                                _patient_id: selectedPatient?._id || id, // Ensure _patient_id is added here
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
                (item) => item?.id !== productId
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
            !item.properties.capsule ||
            !item.properties.frequency ||
            !item.properties.duration ||
            !item.properties.takeWith
        ));
        // return  invalidItems
        if (invalidItems.length > 0) {
            alert("Please fill out all required fields for each item.");
            return;
        }
           console.log('formData',formData)
        try {
            setLoader(true)
            let newdata = {
                selectedItems: selectedItems,
                formData: formData,
                doctor: {
                    id: session?.user?.id,
                    name: session?.userDetail?.firstName + ' ' + session?.userDetail?.lastName,
                    email: session?.userDetail?.email,
                    clinicName: session?.userDetail?.clinicName
                },
                doctorCommission: formData.discount ? (commissionPercentage - formData.discount) : commissionPercentage,
            }
            const response = await fetch(`/api/plans/edit/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newdata),
            });
            if (!response.ok) throw new Error('Failed to submit data');
            Swal.fire({
                title: 'Success!',
                iconHtml: '<img src="/images/succes_icon.png" alt="Success Image" class="custom-icon" style="width: 63px; height: 63px;">',
                text: `You have successfully emailed ${selectedPatient.firstName} ${selectedPatient.lastName}`,
                confirmButtonText: 'OK',
                confirmButtonColor: "#3c96b5",
            });
            setLoader(false)
            router.push('/plans/review');
        } catch (error) {
            setLoader(false)

            console.error("Error saving data:", error);
        }
    };

    const handleSavePlan = async () => {
        const invalidItems = formData.items.filter(item => (
            !item.properties.capsule ||
            !item.properties.frequency ||
            !item.properties.duration ||
            !item.properties.takeWith
        ));
        // return  invalidItems
        if (invalidItems.length > 0) {
            alert("Please fill out all required fields for each item.");
            return;
        }
        try {
            setLoader(true)
            let newdata = {
                selectedItems: selectedItems,
                formData: formData,
                doctor: {
                    id: session?.user?.id,
                    name: session?.userDetail?.firstName + ' ' + session?.userDetail?.lastName,
                    email: session?.userDetail?.email,
                    clinicName: session?.userDetail?.clinicName
                },
                doctorCommission: formData.discount ? (commissionPercentage - formData.discount) : commissionPercentage,
            }
            const response = await fetch(`/api/plans/savePlans/edit/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newdata),
            });
            if (!response.ok) throw new Error('Failed to submit data');
            Swal.fire({
                title: 'Success!',
                iconHtml: '<img src="/images/succes_icon.png" alt="Success Image" class="custom-icon" style="width: 63px; height: 63px;">',
                text: `You have successfully saved the plan for  ${selectedPatient.firstName} ${selectedPatient.lastName}`,
                confirmButtonText: 'OK',
                confirmButtonColor: "#3c96b5",
            });
            setLoader(false)
            router.push('/plans/saved');
        } catch (error) {
            setLoader(false)

            console.error("Error saving data:", error);
        }
    };

    const isProductSelected = (productId) => selectedItems.some(item => item.id === productId);


    const openModal = () => {
        setIsModalOpen(true);
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        document.body.classList.remove('modal-open');
        setSelectedProduct(null);
    };

    const filteredProducts = variants.filter(product =>
        product.title.toLowerCase().includes(searchTerm)
    )

    const handleSearchChange = (event) => setSearchTerm(event.target.value.toLowerCase());


    const handleSelectPatient = (e) => {
        const selectedId = e.target.value;
        const selected = patients.find((patient) => patient._id === selectedId);
        setSelectedPatient(selected);
        setFormData((prevData) => ({
            ...prevData,
            patient_id: selectedId,
        }));
    }

    // console.log(formData.items)


    const fetchPlanData = async () => {
        try {
            const response = await fetch(`/api/plans/edit/${id}`);
            const data = await response.json();
            if (response.ok) {
             const matchedPatient = patients.find(patient => patient._id === data?.patient_id?._id);
                if (matchedPatient) {
                    setSelectedPatient(matchedPatient);
                    setFormData((prevData) => ({
                        ...prevData,
                        patient_id: matchedPatient._id,
                    }));
                }
                const mappedItems = data.items.map(item => ({
                    id: item.id,
                    quantity: item.quantity || 1,
                    price: item.price,
                    title: item.title,
                    image: item.image,
                    discount: item.discount,
                    // Ensure the image is present in properties or set as null
                    description: item.description,
                    properties: {
                        capsule: item.properties.capsule,
                        frequency: item.properties.frequency || 'Once Per Day (Anytime)',
                        duration: item.properties.duration || 'Once Per Day',
                        takeWith: item.properties.takeWith || 'Water',
                        _patient_id: matchedPatient?._id || '',
                        notes: item.properties.notes || ''
                    }
                }));
                const mappedMailData = data.items.map(item => ({
                    image: item.properties?.image || null, // Ensure the image is present in properties or set as null
                    description: item.properties?.description || '' // Ensure description is present in properties or set as empty string
                }));

                // Update formData items and mailData
                setFormData(prevData => ({
                    ...prevData,
                    items: mappedItems,
                    discount: data.discount ? data.discount : "",
                    mailData: mappedMailData,
                    message: data?.message
                }));

                mappedItems.forEach(mappedItem => {
                    const matchingProduct = allVariants.find(item => item.id == mappedItem.id);


                    if (matchingProduct) {
                        handleSelectProduct(matchingProduct);
                    }
                });
         
                setFetchLoader(false)
                // setFormData(prevData => ({ ...prevData, items: mappedItems, message: data?.message }))

            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to fetch Plan data.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: "#3c96b5",
                });
                setFetchLoader(false)

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
            setFetchLoader(false)

        }
    };

    useEffect(() => {
        fetchPlanData();
        // setFetchLoader(false);
    }, [id, variants, patients]);



    const subtotal = formData.items.reduce((acc, item) => {
        return acc + (parseFloat(item.price) || 0);  // Ensure item.price is treated as a float
    }, 0);


    // const discount = subtotal * parseFloat(formData.discount);



    // const doctorCommission = subtotal * (commissionPercentage / 100);
    useEffect(() => {
        if (subtotal > 0 && parseFloat(commissionPercentage) > 0) {
            const discountValue = formData.discount === "" ? 0 : parseFloat(formData.discount);

            // Calculate discount amount
            const discount = (subtotal * discountValue) / 100;

            // Calculate doctor commission after discount
            const doctorPrice = (subtotal * parseFloat(commissionPercentage)) / 100 - discount;

            // Update states
            setDicountPrice(discount); // Discount amount
            setDoctorCommission(doctorPrice);
        }
    }, [formData.discount, commissionPercentage, subtotal]);
    return (
        <AppLayout>
            {!fetchLoader ?
                <div className="flex flex-col">
                    <h1 className="text-2xl pt-4 md:pt-1 mb-1">Edit Patient Plan</h1>
                    <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>
                    <div className="mt-4 md:mt-8 flex max-[767px]:flex-wrap gap-5 xl:gap-8">
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
                                {/* Product Selection */}
                                <div className="px-8 pt-3 pb-8">
                                    <div className="flex max-[767px]:flex-wrap max-[767px]:gap-x-8 max-[767px]:gap-y-4 md:space-x-6 mt-0 md:mt-2 items-center">
                                        {selectedItems.length > 0 && selectedItems.map((variant, index) => (
                                            <div className='thumbnail-box relative max-w-[120px] max-[767px]:max-w-[46%] mt-3 md:mt-0' key={index}>
                                                <button
                                                    onClick={() => { handleDeselectProduct(variant.id) }}
                                                    className="top-[-9px] absolute right-[-9px] w-6 h-6 flex items-center justify-center
                                            bg-[#3c637a] text-white rounded-full text-sm font-bold"
                                                    aria-label="Deselect Product"
                                                >
                                                    &times;
                                                </button>
                                                <img
                                                    src={
                                                        variant.image && variant.image.url
                                                            ? variant.image.url
                                                            : (variant.product && variant.product.images && variant.product.images[0] && variant.product.images[0].url)
                                                                ? variant.product.images[0].url
                                                                : '/images/product-img1.png'
                                                    }
                                                    alt={variant?.product?.title}
                                                    className={`border-4 border-[#3c637a] p-3 ${isProductSelected(variant?.product?.id) ? 'bg-white shadow-2xl' : 'bg-[#F9F9F9]'} rounded-[8px]`}
                                                    onClick={() => handleSelectProduct(variant)}
                                                />
                                                {/* <p className={`font-bold text-[12px] text-center pt-2 ${isProductSelected(variant.product.id) ? 'text-black' : 'text-textColor'}`}>
                                            {variant.product.title}
                                        </p> */}
                                            </div>
                                        ))}
                                        {/* Plus Button to Add More Products */}
                                        {selectedItems.length > 0 ?
                                            <button
                                                className="h-[63px] max-w-[63px] w-full bg-[#3c637a] flex items-center justify-center text-2xl font-bold text-white cursor-pointer rounded-[8px]"
                                                onClick={openModal}
                                            >
                                                +
                                            </button> :
                                            <button
                                                className="min-w-[160px] flex items-center justify-center text-2xl font-bold text-white cursor-pointer rounded-[8px] overflow-hidden"
                                                onClick={openModal}
                                            >
                                                <span className='bg-[#3c637a] py-[4px] px-[15px]'>+</span> <span className='bg-[#5480A0] text-base font-medium p-2'>Add Bova Supplements</span>
                                            </button>
                                        }
                                    </div>
                                </div>


                                {/* Product Info */}
                                {selectedItems.length > 0 && selectedItems.map((item, index) => {
                                    const itemData = formData.items.find(fItem => fItem.id === item.id);
                                    return (<div key={index} className="p-8 border-t border-[#AFAAAC] flex max-[1200px]:flex-wrap gap-4">
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
                                                <p className="text-textColor mt-2 text-base max-w-full">
                                                    {item?.product?.descriptionHtml
                                                        ? new DOMParser().parseFromString(item.product.descriptionHtml, 'text/html').body.textContent
                                                        : ''}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Product Options */}
                                        <div className="space-y-4 w-full">
                                            <div className="border border-customBorder px-[11px] xl:px-[15px] pt-[10px] pb-[15px] rounded-[10px]
                                    max-[767px]:w-full w-[max-content]
                                    min-w-[270px]">
                                                <label className="block text-sm ml-2 font-normal text-gray-700">Capsules</label>
                                                <div className="relative">
                                                    <select
                                                        value={itemData?.properties.capsule ?? ""}
                                                        onChange={(e) => handleFormDataChange(item.id, 'capsule', e.target.value)}
                                                        className="block w-full font-medium px-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-[#52595b] text-lg rounded-md">

                                                        <option value="1">1 </option>
                                                        <option value="2">2 </option>
                                                        <option value="3">3 </option>
                                                        <option value="5">5 (recommended)</option>
                                                        <option value="6">6 </option>
                                                        <option value="7">7 </option>
                                                        <option value="8">8 </option>


                                                    </select>
                                                </div>
                                            </div>
                                            <div className="border border-customBorder px-[11px] xl:px-[15px] pt-[10px] pb-[15px] rounded-[10px] w-full min-[768px]:max-w-[510px] min-w-[270px]">
                                                <label className="block text-sm ml-2 font-normal text-gray-700">Frequency</label>
                                                <div className="relative">
                                                    <select
                                                        value={itemData?.properties.frequency ?? ""}
                                                        onChange={(e) => handleFormDataChange(item.id, 'frequency', e.target.value)}
                                                        className="block w-full font-medium px-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-[#52595b] text-md rounded-md">
                                                        <option>Daily Anytime</option>
                                                        <option>Once Per Day(anytime)</option>
                                                        <option>Once Per Day(morning)</option>
                                                        <option>Once Per Day(evening)</option>
                                                        <option>Once Per Day(on an empty stomach)</option>
                                                        <option>Once Per Day(after a meal)</option>
                                                        <option>Twice Per Day(anytime)</option>
                                                        <option>Twice Per Day(evening)</option>
                                                        <option>Twice Per Day(on an empty stomach)</option>
                                                        <option>Twice Per Day(after a meal)</option>
                                                        <option>3 Times Per Day(anytime)</option>
                                                        <option>Three Times Per Day(evening)</option>
                                                        <option>Three Times Per Day(on an empty stomach)</option>
                                                        <option>Three Times Per Day(after a meal)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="border border-customBorder px-[11px] xl:px-[15px] pt-[10px] pb-[15px] rounded-[10px] w-full min-[768px]:max-w-[510px] min-w-[270px]">
                                                <label className="block text-sm ml-2 font-normal text-gray-700">Duration</label>
                                                <div className="relative">
                                                    <select
                                                        value={itemData?.properties.duration ?? ""}
                                                        onChange={(e) => handleFormDataChange(item.id, 'duration', e.target.value)}
                                                        className="block w-full font-medium px-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-[#52595b] text-lg rounded-md">
                                                        <option> Monthly (Recommended)</option>
                                                        <option>1 Day</option>
                                                        <option>5 Days</option>
                                                        <option>7 Days (1 Week)</option>
                                                        <option>2 Weeks</option>
                                                        <option>3 Weeks</option>
                                                        <option>1 Month</option>
                                                        <option>3 Months</option>
                                                        <option>6 Months</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="border border-customBorder px-[11px] xl:px-[15px] pt-[10px] pb-[15px] rounded-[10px] w-full min-[768px]:max-w-[510px] min-w-[270px]">
                                                <label className="block text-sm ml-2 font-normal text-gray-700">Take with</label>
                                                <div className="relative">
                                                    <select
                                                        value={itemData?.properties.takeWith ?? ""}
                                                        onChange={(e) => handleFormDataChange(item.id, 'takeWith', e.target.value)}
                                                        className="block w-full font-medium px-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-[#52595b] xl:text-lg rounded-md">
                                                        <option>Water</option>
                                                        <option>Food</option>
                                                        <option>Water and Empty Stomach</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className='w-full min-[768px]:max-w-[510px]'>
                                                <div className="mt-1">
                                                    <textarea placeholder='Add Notes'
                                                        value={itemData?.properties.notes ?? ""}
                                                        onChange={(e) => handleFormDataChange(item.id, 'notes', e.target.value)} className="block w-full px-[25px] py-[10px] border border-customBorder rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-[#52595b] text-base xl:text-lg" rows="3"></textarea>
                                                </div>
                                            </div>
                                        </div>

                                    </div>)
                                })
                                }
                                {/* Message Section */}
                                {selectedItems.length > 0 && <div className="p-8 pb-4 border-t border-[#AFAAAC]">
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData((prevFormData) => ({ ...prevFormData, message: e.target.value, }))}
                                        className="w-full border border-customBorder rounded-md focus:outline-none min-h-[50px] rounded-[8px] p-4 mt-1 mb-4 resize-none focus:border-indigo-500 text-[#52595b] text-base xl:text-lg"
                                        rows="4"
                                        placeholder="Message"
                                    ></textarea>
                                </div>}
                                {/* Send to Patient Button */}
                                <div className="hidden min-[768px]:block p-4 text-right border-t border-[#AFAAAC]">
                                <button
                                    onClick={() => { handleSavePlan() }}
                                    disabled={formData.items.length === 0 || !formData.patient_id}
                                    className={`py-2 px-4 min-w-[130px] mr-2 text-sm min-h-[46px] rounded-[8px]
                                            ${formData.items.length === 0 || !formData.patient_id
                                            ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-customBg2 border border-customBg2 text-white hover:text-customBg2 hover:bg-white'}`
                                    }>
                                    {loader ? "Please wait ..." : 'Update Only'}
                                </button>
                                    <button
                                        onClick={() => { handleSubmit() }}
                                        disabled={formData.items.length === 0 || !formData.patient_id}
                                        className={`py-2 px-4 min-w-[150px] min-h-[46px] rounded-[8px]
                                    ${formData.items.length === 0 || !formData.patient_id
                                                ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-customBg2 border border-customBg2 text-white hover:text-customBg2 hover:bg-white'}`
                                        }>
                                        {loader ? "Please wait..." : "Update and Send"}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Right Column - Price Summary */}
                        {selectedItems.length > 0 &&
                            <div className="space-y-4 w-full max-w-[100%] md:max-w-[310px]">
                                <div className='border border-customBorder p-5 rounded-lg'>
                                    <div class="form-floating">
                                        <label for="floatingSelect" className='font-semibold text-base text-textColor3 block'>Select Patient Discount</label>
                                        <select
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
                                        <span className="font-semibold text-base text-textColor3 uppercase">Price</span>
                                        <div className="mt-2 overflow-x-auto">
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
                                                    {/* <tr className="">
                                                        <td className="py-2 text-textColor3 text-sm" colSpan="2">Doctor commission</td>
                                                        <td className="py-2 text-textColor3 text-sm text-right">${doctorCommission.toFixed(2)}</td>
                                                    </tr> */}
                                                    <tr className="border-b border-[#AFAAAC] pb-4">
                                                        <td className="py-2 text-textColor3 text-sm" colSpan="2">Subtotal</td>
                                                        <td className="py-2 font-bold text-[#53595B]  text-right">
                                                            ${(subtotal - dicountPrice).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className='text-right pt-5 flex gap-2'>
                                            <button
                                                onClick={() => { handleSavePlan() }}
                                                disabled={formData.items.length === 0 || !formData.patient_id}
                                                className={`py-2 px-4 min-w-[100px] text-sm min-h-[46px] rounded-[8px]
                                            ${formData.items.length === 0 || !formData.patient_id
                                                        ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-customBg2 border border-customBg2 text-white hover:text-customBg2 hover:bg-white'}`
                                                }>
                                                {loader ? "Please wait ..." : 'Update Only'}
                                            </button>

                                            <button
                                                onClick={() => { handleSubmit() }}
                                                disabled={formData.items.length === 0 || !formData.patient_id}
                                                className={`py-2 px-4 min-w-[130px] text-sm min-h-[46px] rounded-[8px]
                                            ${formData.items.length === 0 || !formData.patient_id
                                                        ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-customBg2 border border-customBg2 text-white hover:text-customBg2 hover:bg-white'}`
                                                }>
                                                {loader ? "Please wait ..." : 'Update and Send'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button className={`py-2 px-4 w-full min-h-[46px] rounded-[8px] bg-[#2080b4] border border-customBg2  cursor-text text-white`}> Doctor Commission : <strong>${doctorCommission.toFixed(2)}</strong> </button>
                            </div>
                        }
                    </div>

                    {isModalOpen && (
                        <div className="fixed p-3 inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-hidden overflow-y-auto">
                            <div className=" create-popup-wrapper bg-white p-6 pb-4 rounded-lg max-w-[98%] md:max-w-[1020px] max-h-[98%] md:max-h-[100%] w-full overflow-hidden overflow-y-auto">
                                <div className='flex justify-between items-center md:pb-4'>
                                    <h2 className="text-xl font-bold mb-3">Select Product</h2>
                                    <button onClick={closeModal}> <CloseIcon /> </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search for a product"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full px-4 py-2 mb-3 border rounded-lg"
                                />

                                {/* Product List in Single Line */}
                                <div className='desktop-only'>

                                    <div className="max-h-[600px] overflow-y-auto">
                                        {filteredProducts.length > 0 ? (
                                            <div className="mt-4">
                                                <table className="min-w-full bg-white">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase">Image</th>
                                                            <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase">Title</th>
                                                            <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase">SKU</th>
                                                            <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase">MSRP</th>
                                                            <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredProducts.map((variant, index) => {
                                                            const isProductAdded = selectedItems.some(item => item.id === variant.id);
                                                            return (
                                                                <tr
                                                                    key={index}
                                                                    className={`border-b hover:bg-gray-50 ${isProductAdded ? 'opacity-50 pointer-events-none' : ''}`} // Disable product selection if already added
                                                                >
                                                                    <td className="px-6 py-4 whitespace-nowrap min-w-[125px] ">
                                                                        <img
                                                                            src={
                                                                                variant.image && variant.image.url
                                                                                    ? variant.image.url
                                                                                    : (variant.product.images && variant.product.images[0] && variant.product.images[0].url)
                                                                                        ? variant.product.images[0].url
                                                                                        : '/images/product-img1.png'
                                                                            }
                                                                            alt={variant.product.title}
                                                                            className="w-[40px] md:w-[80px] h-[40px] md:h-[80px] p-0 md:p-2 bg-[#F9F9F9] rounded-lg"
                                                                        />
                                                                    </td>
                                                                    <td className="px-6 py-4  whitespace-break-spaces text-gray-700 font-medium">{variant.product.title}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{variant.sku || 'N/A'}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">${variant.price || 'N/A'}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <button
                                                                            onClick={() => { handleSelectProduct(variant) }}
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
                                            <div className='text-center w-full'>
                                                <p className="text-gray-500 mt-7 font-bold">No products found</p>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => { closeModal() }}
                                        className="py-2 mt-4 float-right px-4 bg-[#25464F] border border-[#25464F] text-white rounded-[8px] hover:text-[#25464F] hover:bg-white min-w-[150px] min-h-[46px] ">
                                        FINISH
                                    </button>
                                </div>
                                <div className=' mob-only'>
                                    {filteredProducts.length > 0 ? (
                                        <div className="product-itm-wrapper">
                                            <div className="product-itm-container">

                                                {filteredProducts.map((variant, index) => {
                                                    const isProductAdded = selectedItems.some(item => item.id === variant.id);
                                                    return (
                                                        <div className="product-itm-mob" key={index}>
                                                            <div className="product-itm-img">
                                                                <img src={
                                                                    variant.image && variant.image.url
                                                                        ? variant.image.url
                                                                        : (variant.product.images && variant.product.images[0] && variant.product.images[0].url)
                                                                            ? variant.product.images[0].url
                                                                            : '/images/product-img1.png'
                                                                }
                                                                    alt={variant.product.title}
                                                                    className="w-[40px] md:w-[80px] h-[40px] md:h-[80px] p-0 md:p-2 bg-[#F9F9F9] rounded-lg"
                                                                />
                                                            </div>
                                                            <div className="product-itm-des">
                                                                <h3>{variant.product.title}</h3>
                                                                <div className="product-des-inner">
                                                                    <div className="product-des-price">
                                                                        <p>{variant.sku || 'N/A'}</p>
                                                                        <h6>${variant.price || 'N/A'}</h6>
                                                                    </div>
                                                                    <div className="product-price">
                                                                        <button
                                                                            onClick={() => { handleSelectProduct(variant) }}
                                                                            className="bg-customBg2 border border-customBg2 text-white px-4 py-2 rounded hover:bg-white hover:text-customBg2 disabled:opacity-50"
                                                                            disabled={isProductAdded}
                                                                        >
                                                                            {isProductAdded ? 'Added' : 'Add'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                            </div>
                                            <button onClick={() => { closeModal() }}
                                                className="btn-submit-product py-2 mt-4 float-right px-4 bg-[#25464F] border border-[#25464F] text-white rounded-[8px] hover:text-[#25464F] hover:bg-white min-w-[150px] min-h-[46px] ">
                                                FINISH
                                            </button>
                                        </div>
                                    ) : (
                                        <div className='text-center w-full'>
                                            <p className="text-gray-500 mt-7 font-bold">No products found</p>
                                        </div>
                                    )}
                                </div>
                            </div >
                        </div >
                    )
                    }
                </div > : <Loader />
            }
        </AppLayout >
    )
}
