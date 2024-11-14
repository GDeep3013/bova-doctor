
'use client'
import AppLayout from '../../../../components/Applayout';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import Swal from 'sweetalert2';
import { CloseIcon } from '../../../../components/svg-icons/icons';

export default function CreatePlan() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [savedProduct, setsavedProduct] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
 
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

        const fetchSavedProduct = async () => {
            try {
            const response = await fetch(`/api/products`);
            if (!response.ok) throw new Error('Failed to fetch product status');
                const data = await response.json();
                setsavedProduct(data);
            } catch (error) {
            console.error("Error fetching product status:", error);
            }
        };

        

    useEffect(() => {
        fetchProducts();
        fetchSavedProduct();
    }, []);

    useEffect(() => {
        if (products.length && savedProduct.length) {
            const updatedSelectedItems = savedProduct.filter((sProduct) => {
                const matchedProduct = products.find((product) => product.id === sProduct.product_id);
                return matchedProduct && sProduct.status === 'active';
            }).map((sProduct) => {
                const matchedProduct = products.find((product) => product.id === sProduct.product_id);
                return matchedProduct ? matchedProduct : null;
            }).filter(item => item !== null);
            setSelectedItems(updatedSelectedItems);
        }
    }, [products, savedProduct]);


    const handleSelectProduct = (product) => {
        setSelectedItems((prevSelectedItems) => {
            const productExists = prevSelectedItems.some((item) => item.id === product.id);
            if (productExists) return prevSelectedItems;
            return [...prevSelectedItems, product];
        });
        updateStatus(product ,'active')
       
    };

  

    const handleDeselectProduct = (productId,product) => {
        setSelectedItems((prevSelectedItems) => {
            const updatedSelectedItems = prevSelectedItems.filter(
                (item) => item?.variants[0]?.id !== productId
            );
            return updatedSelectedItems;
        });
        console.log('product',product)
        updateStatus(product, 'inactive')
        
    };


    const isProductSelected = (productId) => selectedItems.some(item => item.id === productId);
 

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
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
              console.log('error',error)
          }
        };
        if (searchTerm) {
            searchProducts();
        } else {
            fetchProducts()
            }
      }, [searchTerm])
      



 

    return (
        <AppLayout>
            <div className="flex flex-col">
                <h1 className="text-2xl pt-4 md:pt-1 mb-1">Products</h1>
                <button className="text-gray-600 text-sm mb-4 text-left">&lt; Back</button>
                <div className="mt-4 md:mt-8 flex max-[767px]:flex-wrap gap-8">
                    <div className="lg:col-span-2 space-y-4 rounded-lg bg-white border border-[#AFAAAC] w-full">
                        <div className='p-0'>
                            {/* Product Selection */}
                            <div className="p-4">
                                <span className="text-textColor font-medium cursor-pointer">Select Items:</span>
                                <div className="flex max-[767px]:flex-wrap max-[767px]:gap-x-8 max-[767px]:gap-y-4 md:space-x-6 mt-0 md:mt-2">
                                    {selectedItems.map((product, index) => (
                                        <div className='thumbnail-box relative max-w-[120px] max-[767px]:max-w-[46%] mt-3 md:mt-0' key={index}>
                                            <button
                                                onClick={() => { handleDeselectProduct(product?.variants[0]?.id,product) }}
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


                      
                    
                        </div>
                    </div>
              

                </div>

                {isModalOpen && (
                    <div className="fixed p-2 md:p-0 inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg max-w-[98%] md:max-w-[1020px] max-h-[98%] md:max-h-[100%] w-full">
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
                            <div className="h-[600px] overflow-y-auto">
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
                                    <div className='text-center w-full'>
                                        <p className="text-gray-500 mt-7 font-bold">No products found</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => { closeModal() }}
                                    className="py-2 mt-4 float-right px-4 bg-[#25464F] border border-[#25464F] text-white rounded-[8px] hover:text-customBg2 hover:bg-white min-w-[150px] min-h-[46px] ">
                                    Close
                                </button>
                            </div>





                        </div >
                    </div >
                )
                }
            </div >
        </AppLayout >
    )
}
