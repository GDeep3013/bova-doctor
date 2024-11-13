"use client"
import { useState, useEffect } from 'react';

export default function UpdateStatus({ product }) {
    const [isChecked, setIsChecked] = useState(false);

    // Fetch product status on mount
    useEffect(() => {
      const fetchProductStatus = async () => {
        try {
          const response = await fetch(`/api/products/${product.id}`);
          if (!response.ok) throw new Error('Failed to fetch product status');
          
          const data = await response.json();
          
          // Set checkbox state based on the product's current status
          setIsChecked(data.status === 'active');
        } catch (error) {
          console.error("Error fetching product status:", error);
        }
      };
  
      fetchProductStatus();
    }, [product.id]);

  const toggleStatus = async (product, isChecked) => {
    const newStatus = isChecked ? 'active' : 'inactive';
    try {
      const response = await fetch(`/api/products/create-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              status: newStatus,
              product_id: product.id,
              sku: product?.variants[0]?.sku || 'N/A',
              title:product.title
              
          }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
  
      // Update the UI based on successful status change
      setIsChecked(isChecked);
    } catch (error) {
      console.error("Error updating product status:", error);
      setIsChecked(!isChecked);
    }
  };
  

  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => toggleStatus(product, e.target.checked)}
      />
      <span className="slider round"></span>
    </label>
  );
}
