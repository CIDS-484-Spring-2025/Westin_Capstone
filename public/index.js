        // Cart array to store selected items
        let cart = [];

        //user id for storing cart data
        let currentUserId = null;

        // Fetch items on page load
        document.addEventListener('DOMContentLoaded', () => {
            fetchItems();
            showUserFormPopup();
        });

        // Disaply all items from the database onto the webpage
        async function fetchItems() {
            try {

                const response = await fetch('/api/items');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const items = await response.json();
                console.log('Items:', items); // Log the items

                const itemsGrid = document.getElementById('itemsGrid');
                itemsGrid.innerHTML = ''; // Clear previous items

                items.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('item');


                    //display items from the database
                    itemDiv.innerHTML = `
                <img src="${item.image_url}" alt="${item.item_name}" class="item-image">
                <h3 class="item-name">${item.item_name}</h3>
                <p class="item-description">${item.item_description}</p>
                <p class="item-price">$${parseFloat(item.price).toFixed(2)}</p>
                <button class="view-details" data-id="${item.item_id}">View Details</button>
                <button class="add-to-cart" data-id="${item.item_id}" data-name="${item.item_name}" data-price="${item.price}" data-image="${item.image_url}">Add to Cart</button>
            `;

                    itemDiv.querySelector('.view-details').addEventListener('click', () => {
                        navigateToItem(item.item_id);
                    });

                    itemsGrid.appendChild(itemDiv);
                });

                // Add event listeners to "Add to Cart" buttons
                document.querySelectorAll('.add-to-cart').forEach(button => {
                    button.addEventListener('click', function () {
                        const itemId = this.getAttribute('data-id');
                        const itemName = this.getAttribute('data-name');
                        const itemPrice = parseFloat(this.getAttribute('data-price'));
                        const itemImage = this.getAttribute('data-image');
                        addToCart(itemId, itemName, itemPrice, itemImage);
                    });
                });

            } catch (error) {
                console.error('Error fetching items:', error);
                document.getElementById('itemsGrid').innerHTML = '<p>Failed to load items.</p>';
            }
        }


        // Function to navigate to the item details page
        function navigateToItem(itemId) {
            console.log('Navigating to item details for ID:', itemId); // Debugging

            if (!itemId) {
                console.error('Item ID is missing.');
                return;
            }

            // Save the item ID in local storage
            localStorage.setItem('selectedItemId', itemId);

            // Navigate to the item details page
            window.location.href = 'item.html';
        }

        // Function to update the cart display in the sidebar
        function updateCartUI() {
            const cartList = document.getElementById('cartItems');
            cartList.innerHTML = '';

            cart.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
              <img src="${item.image_url}" alt="${item.item_name}" style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px;">
              <strong>${item.item_name}</strong>  $${parseFloat(item.price).toFixed(2)} (x${item.quantity})
              <button class="remove-from-cart" data-id="${item.item_id}">Remove</button>
          `;
                cartList.appendChild(li);
            });

            // Update the cart counter
            const cartCount = document.getElementById('cartCount');
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);

            // Add event listeners to the remove buttons
            document.querySelectorAll('.remove-from-cart').forEach(button => {
                button.addEventListener('click', async function () {
                    const itemId = this.getAttribute('data-id');
                    await removeFromCart(itemId);
                });
            });
        }

        // Function to add items to the users cart
        async function addToCart(item_id, item_name, price, image_url) {
            const existingItem = cart.find(item => item.item_id === item_id);
            if (existingItem) {
                existingItem.quantity += 1; // Increase quantity if item already in cart
            } else {
                cart.push({ item_id, item_name, price, image_url, quantity: 1 });
            }
            console.log('Cart after adding item:', cart); // Debugging log

            updateCartUI();

            // Store cart item in the database
            if (currentUserId) {
                try {
                    const response = await fetch('/api/add-to-cart', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: currentUserId, itemId: item_id })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to add item to cart in the database.');
                    }
                    
                    const result = await response.json();
                    console.log('Item added to cart in database:', result);
                } catch (error) {
                    console.error('Error adding item to cart in the database:', error);
                    alert('Failed to add item to cart. Please try again.');
                    // Remove the item from the local cart if database update failed
                    cart = cart.filter(item => item.item_id !== item_id);
                    updateCartUI();
                }
            }

            alert(`${item_name} added to cart!`); // Popup confirmation
        }

        // Function to remove items from the users cart
        async function removeFromCart(item_id) {
            const itemIndex = cart.findIndex(item => item.item_id === item_id);
            if (itemIndex === -1) return;

            const item = cart[itemIndex];
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cart.splice(itemIndex, 1);
            }

            updateCartUI();

            // Remove item from the database
            if (currentUserId) {
                try {
                    const response = await fetch('/api/cart_items', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: currentUserId, itemId: item_id })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to remove item from cart in the database.');
                    }

                    const result = await response.json();
                    console.log('Item removed from cart in database:', result);
                } catch (error) {
                    console.error('Error removing item from cart in the database:', error);
                    alert('Failed to remove item from cart. Please try again.');
                    // Revert the local cart state if database update failed
                    if (item.quantity > 1) {
                        item.quantity += 1;
                    } else {
                        cart.splice(itemIndex, 0, item);
                    }
                    updateCartUI();
                }
            }
        }


        // Initialize the items display on page load
        window.onload = fetchItems;

        // Handle user form submission
        document.getElementById('user-form').addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;

            try {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email })
                });

                if (!response.ok) {
                    throw new Error('Failed to create user');
                }

                const data = await response.json();
                currentUserId = data.userId;
                
                // Hide the user form
                document.getElementById('userFormContainer').style.display = 'none';
                
                // Display the username in the header
                const userDisplay = document.getElementById('userDisplay');
                userDisplay.textContent = username;
                
                // Update the main content margin
                document.querySelector('main').style.marginTop = '80px';
                
                // Show success message
                document.getElementById('user-feedback').textContent = 'User created successfully!';
                document.getElementById('user-feedback').style.color = 'var(--white)';
                
                // Clear the form
                document.getElementById('username').value = '';
                document.getElementById('email').value = '';
                
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('user-feedback').textContent = 'Error creating user. Please try again.';
                document.getElementById('user-feedback').style.color = 'var(--secondary-color)';
            }
        });


        // Attach event listeners
        function attachEventListeners() {
            // Toggle user form pop-up
            document.getElementById('userFormButton').addEventListener('click', function () {
                document.getElementById('userFormPopup').style.display = 'block';
            });

            document.getElementById('closeUserForm').addEventListener('click', function () {
                closeUserFormPopup();
            });

            // Toggle cart sidebar
            document.getElementById('cartButton').addEventListener('click', function () {
                document.getElementById('cartSidebar').style.right = '0';
            });

            document.getElementById('closeCart').addEventListener('click', function () {
                document.getElementById('cartSidebar').style.right = '-300px';
            });

            // Add event listener to search button
            document.getElementById('searchButton').addEventListener('click', searchItems);
        }

        // Show user form popup on page load
        function showUserFormPopup() {
            document.getElementById('userFormPopup').style.display = 'block';
        }

        // Close user form popup
        function closeUserFormPopup() {
            document.getElementById('userFormPopup').style.display = 'none';
        }

        /* Fetch cart items
        async function fetchCart() {
            if (!currentUserId) return;

            try {
                const response = await fetch(`/api/cart/${currentUserId}`);
                const cartItems = await response.json();

                cart = cartItems; // Update the cart array with items from the database
                updateCartUI();
            } catch (error) {
                console.error('Error fetching cart:', error);
            }
        } */

        // Search items
        async function searchItems() {
            const searchTerm = document.getElementById('searchInput').value; // Normalize input
            console.log('Search term:', searchTerm); // Log the search term

            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const items = await response.json();
                console.log('Search results:', items); // Log the search results

                const itemsGrid = document.getElementById('itemsGrid');
                itemsGrid.innerHTML = ''; // Clear previous items

                // Display items from search results
                if (items.length === 0) {
                    itemsGrid.innerHTML = '<p>No items found.</p>';
                    return;
                }

                items.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'item';

                    itemDiv.innerHTML = `
                <img src="${item.image_url}" alt="${item.item_name}" class="item-image">
                <h3 class="item-name">${item.item_name}</h3>
                <p class="item-description">${item.item_description}</p>
                <p class="item-price">$${parseFloat(item.price).toFixed(2)}</p>
                <button class="view-details" data-id="${item.item_id}">View Details</button>
                <button class="add-to-cart" data-id="${item.item_id}" data-name="${item.item_name}" data-price="${item.price}" data-image="${item.image_url}">Add to Cart</button>
            `;

                    itemsGrid.appendChild(itemDiv);
                });

                // Add event listeners to "Add to Cart" buttons
                document.querySelectorAll('.add-to-cart').forEach(button => {
                    button.addEventListener('click', function () {
                        const itemId = this.getAttribute('data-id');
                        const itemName = this.getAttribute('data-name');
                        const itemPrice = parseFloat(this.getAttribute('data-price'));
                        const itemImage = this.getAttribute('data-image');
                        addToCart(itemId, itemName, itemPrice, itemImage);
                    });
                });

            } catch (error) {
                console.error('Error searching items:', error);
                document.getElementById('itemsGrid').innerHTML = '<p>Failed to load search results.</p>';
            }
        }


        // Open Cart Sidebar
        document.getElementById('cartButton').addEventListener('click', () => {
            document.getElementById('cartSidebar').style.right = '0';
        });

        // Close Cart Sidebar
        document.getElementById('closeCart').addEventListener('click', () => {
            document.getElementById('cartSidebar').style.right = '-300px';
        });

        // Search Button Click
        document.getElementById('searchButton').addEventListener('click', searchItems);

  