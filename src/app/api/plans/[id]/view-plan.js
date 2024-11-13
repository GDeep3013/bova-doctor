<div id="loader" style="display:none;">Loading...</div>  <!-- This is the loader element -->

<div>Hello</div>

<script>
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  
  if (id) {
    fetchDataAndAddToCart(id);
  } else {
    console.error('No ID found in URL');
  }

  async function fetchDataAndAddToCart(id) {
    try {
      // Show the loader
      showLoader();

      const response = await fetch(`https://inventory.webziainfotech.com/api/plans/${id}`);
      const data = await response.json();

      // Hide the loader once the fetch completes
      hideLoader();

      if (data.success && data.data.items.length > 0) {
        await clearShopifyCart();
        await addItemsToShopifyCart(data.data.items);
      } else {
        alert(data.message);
        console.error('No items to add or invalid response status.');
      }
    } catch (error) {
      // Hide the loader in case of error
      hideLoader();
      console.error('Error fetching data:', error);
    }
  }

  async function clearShopifyCart() {
    await fetch('/cart/clear.js', { method: 'POST' });
  }

  async function addItemsToShopifyCart(items) {
    try {
      let formData = { 'items': items };
      
      // Show the loader
      showLoader();

      // Loop through the items and add them to the cart
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),  // Send each item individually (not the whole items array)
      });

      // Hide the loader after adding items
      hideLoader();

      // Check if the response is successful (status code 200)
      if (!response.ok) {
        // If the response is not successful, throw an error
        throw new Error('Failed to add item to cart');
      }

      // If all items were added successfully, redirect to the cart
      window.location.href = '/cart';
    } catch (error) {
      // Hide the loader in case of error
      hideLoader();
      console.error('Error adding items to cart:', error.message);
      alert('There was an issue adding items to your cart. Please try again.');
    }
  }

  // Function to show the loader
  function showLoader() {
    document.getElementById('loader').style.display = 'block';
  }

  // Function to hide the loader
  function hideLoader() {
    document.getElementById('loader').style.display = 'none';
  }
</script>

{% schema %}
  {
    "name": "View Plan",
    "settings": [],
    "presets": [
      {
    "name": "View Plan"    
      }
    ]
  }
{% endschema %}
