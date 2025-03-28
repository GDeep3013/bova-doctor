
'use client'
import AppLayout from '../../../../components/Applayout';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import Swal from 'sweetalert2';
import { CloseIcon } from '../../../../components/svg-icons/icons';
import Loader from 'components/loader';
export default function CreatePlan() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [savedProduct, setsavedProduct] = useState([]);
    const [fetchLoader, setFetchLoader] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [updateSelectedItems, setUpdateSelectedItems] = useState(false);


    const fetchProducts = async () => {
        try {
            setFetchLoader(true)
            const response = await fetch('/api/shopify/products');
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data);
            if (updateSelectedItems) {
                setFetchLoader(false)
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            if (updateSelectedItems) {
                setFetchLoader(false)
            }

        }
    }

        const fetchSavedProduct = async () => {
            try {
            const response = await fetch(`/api/products`);
            if (!response.ok) throw new Error('Failed to fetch product status');
                const data = await response.json();
                setsavedProduct(data);
                setFetchLoader(false)
            } catch (error) {
                console.error("Error fetching product status:", error);
                setFetchLoader(false)
            }
        };



    useEffect(() => {
        fetchProducts('yes');
        fetchSavedProduct();
    }, []);

    useEffect(() => {


        if (products.length && savedProduct.length && updateSelectedItems ==false) {
            const updatedSelectedItems = savedProduct.filter((sProduct) => {
                const matchedProduct = products.find((product) => product.id === sProduct.product_id);
                return matchedProduct && sProduct.status === 'active';
            }).map((sProduct) => {
                const matchedProduct = products.find((product) => product.id === sProduct.product_id);
                return matchedProduct ? matchedProduct : null;
            }).filter(item => item !== null);
            setSelectedItems(updatedSelectedItems);
        }


    }, [products, savedProduct ,updateSelectedItems]);


    const handleSelectProduct = (product) => {

        setSelectedItems((prevSelectedItems) => {
            const productExists = prevSelectedItems.some((item) => item.id === product.id);
            if (productExists) return prevSelectedItems;
            return [...prevSelectedItems, product];
        });
        updateStatus(product, 'active')


    };



    const handleDeselectProduct = (productId,product) => {
        setSelectedItems((prevSelectedItems) => {
            const updatedSelectedItems = prevSelectedItems.filter(
                (item) => item?.variants[0]?.id !== productId
            );
            return updatedSelectedItems;
        });

        updateStatus(product, 'inactive')

    };


    const isProductSelected = (productId) => selectedItems.some(item => item.id === productId);


    const openModal = () => {
        setIsModalOpen(true);
        document.body.classList.add('modal-open');

    };

    const closeModal = () => {
        setIsModalOpen(false);
        document.body.classList.remove('modal-open');

    };

    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm)
    )

    const handleSearchChange = (event) => setSearchTerm(event.target.value.toLowerCase());


    const updateStatus = async (product, status) => {
        try {
          const response = await fetch(`/api/products/create-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  status: status,
                  product_id: product.id,
                  sku: product?.variants[0]?.sku || 'N/A',
                  title: product.title,
                  variant_id:product?.variants[0]?.id

              }),
          });

          if (!response.ok) {
            throw new Error('Failed to update status');
          }

        } catch (error) {
          console.error("Error updating product status:", error);
          setIsChecked(!isChecked);
        }
    };

    useEffect(() => {

        const searchProducts = async () => {
            try {
            const url = `/api/shopify/products/search?q=${searchTerm}`;
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error('Failed to fetch products');
            }
            const data = await response.json();

                setProducts(data);
          } catch (error) {
                console.log('error', error)

          }
        };
        if (searchTerm) {
            setUpdateSelectedItems(true)

            searchProducts();
        } else {
            // setUpdateSelectedItems(true)
            fetchProducts()
            }
      }, [searchTerm])






    return (
        <AppLayout>
            <div className="flex flex-col">
                {fetchLoader && !updateSelectedItems ? <Loader /> : <>
                    <h1 className="text-2xl pt-4 md:pt-1 mb-1">Products</h1>
                    {/* <button className="text-gray-600 text-sm mb-4 text-left">&lt; Back</button> */}
                    <div className="mt-4 md:mt-8 flex max-[767px]:flex-wrap gap-8">
                        <div className="lg:col-span-2 space-y-4 rounded-lg bg-white border border-customBorder w-full max-w-[1334px]">
                            <div className='p-0'>
                                {/* Product Selection */}
                                <div>
                                    <div className="bg-customBg p-4 px-3 md:px-5 rounded-t-[8px]"><span className="font-medium text-[14px] md:text-base text-gray-700">Select Products:</span></div>
                                    <div className='p-4'>
                                        <span className="text-textColor font-medium cursor-pointer">Select Products:</span>
                                        <div className="flex max-[767px]:flex-wrap max-[767px]:gap-x-8 max-[767px]:gap-y-4 md:space-x-6 mt-0 md:mt-5 items-center">
                                            {selectedItems.map((product, index) => (
                                                <div className='thumbnail-box relative max-w-[120px] max-[767px]:max-w-[43%] mt-3 md:mt-0' key={index}>
                                                    <button
                                                        onClick={() => { handleDeselectProduct(product?.variants[0]?.id, product) }}
                                                        className="top-[-9px] absolute right-[-9px] w-6 h-6 flex items-center justify-center
                                                bg-[#3c637a] text-white rounded-full text-sm font-bold"
                                                        aria-label="Deselect Product"
                                                    >
                                                        &times;
                                                    </button>
                                                    {product.image && (
                                                        <img
                                                            src={product.image.src} // Replace with actual paths
                                                            alt={product.title}
                                                            className={`border-4 border-[#3c637a] p-3 ${isProductSelected(product.id) ? 'bg-white shadow-2xl' : 'bg-[#F9F9F9]'} rounded-[8px]`}
                                                            onClick={() => handleSelectProduct(product)}
                                                        />
                                                    )}
                                                    {/* <p className={`font-bold text-[12px] text-center pt-2 ${isProductSelected(product.id) ? 'text-black' : 'text-textColor'}`}>
                                                {product.title}
                                            </p> */}
                                                </div>
                                            ))}
                                            {/* Plus Button to Add More Products */}
                                            <button
                                                className="h-[63px] max-w-[63px] w-full bg-[#3c637a] flex items-center justify-center text-2xl font-bold text-white cursor-pointer rounded-[8px]"
                                                onClick={openModal}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>




                            </div>
                        </div>


                    </div>

                    {isModalOpen && (
                        <div className="fixed p-3 inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-hidden overflow-y-auto">
                            <div className=" create-popup-wrapper bg-white p-6 pb-4 rounded-lg max-w-[98%] md:max-w-[1020px] max-h-[98%] md:max-h-[100%] w-full overflow-hidden overflow-y-auto">
                                <div className='flex justify-between items-center p-2 md:py-4'>
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
                                <div className='desktop-only'>

                                <div className="h-[600px] overflow-y-auto">
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
                                                        {
                                                            (fetchLoader && updateSelectedItems) ? <Loader /> : filteredProducts.map((product, index) => {
                                                        const isProductAdded = selectedItems.some(item => item.id === product.id);
                                                        return (
                                                            <tr
                                                                key={index}
                                                                className={`border-b hover:bg-gray-50 ${isProductAdded ? 'opacity-50 pointer-events-none' : ''}`} // Disable product selection if already added
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap min-w-[125px]">
                                                                    <img
                                                                        src={product.image?.src || '/images/product-img1.png'}
                                                                        alt={product.title}
                                                                        className="w-[40px] md:w-[80px] h-[40px] md:h-[80px] p-0 md:p-2 bg-[#F9F9F9] rounded-lg"
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-break-spaces text-gray-700 font-medium">{product.title}</td>
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
                                        <div className='text-center w-full'>
                                            <p className="text-gray-500 mt-7 font-bold">No products found</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => { closeModal() }}
                                        className="py-2 mt-4 float-right px-4 bg-[#25464F] border border-[#25464F] text-white rounded-[8px] hover:text-[#25464F] hover:bg-white min-w-[150px] min-h-[46px] ">
                                        FINISH
                                    </button>
                                    </div>
                                </div>
                                <div className='mob-only'>
                                {filteredProducts.length > 0 ? (
                                <div className="product-itm-wrapper ">
                                <div className="product-itm-container">                                
                                        {filteredProducts.map((product, index) => {
                                                        const isProductAdded = selectedItems.some(item => item.id === product.id);
                                                        return (
                                                <div className="product-itm-mob" key={index}>
                                                    <div className="product-itm-img">
                                                    <img
                                                        src={product.image?.src || '/images/product-img1.png'}
                                                        alt={product.title}
                                                        className="w-[40px] md:w-[80px] h-[40px] md:h-[80px] p-0 md:p-2 bg-[#F9F9F9] rounded-lg"
                                                    />
                                                    </div>
                                                    <div className="product-itm-des">
                                                        <h3>{product.title}</h3>
                                                        <div className="product-des-inner">
                                                            <div className="product-des-price">
                                                            <p>{product?.variants[0]?.sku || 'N/A'}</p>
                                                                <h6>${product?.variants[0]?.price || 'N/A'}</h6>
                                                            </div>
                                                            <div className="product-price">
                                                            <button
                                                                    onClick={() => { handleSelectProduct(product) }}
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
                                ): (
                                    <div className='text-center w-full'>
                                        <p className="text-gray-500 mt-7 font-bold">No products found</p>
                                    </div>
                                )}
                                </div >
                                </div>
                        </div >
                    )
                    }
                </>}
            </div>
        </AppLayout >
    )
}
