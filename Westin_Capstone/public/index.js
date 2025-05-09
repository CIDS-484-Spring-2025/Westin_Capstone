        // Cart array to store selected items
        let cart = [];

        //user id for storing cart data
        let currentUserId = null;

        // Fetch items on page load
        document.addEventListener('DOMContentLoaded', () => {
            fetchItems();
            attachEventListeners();
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

                displayItems(items);

            } catch (error) {
                console.error('Error fetching items:', error);
                document.getElementById('itemsGrid').innerHTML = '<p>Failed to load items.</p>';
            }
        }

        function displayItems(items) {
            const itemsGrid = document.getElementById('itemsGrid');
            itemsGrid.innerHTML = '';

            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';

                itemDiv.innerHTML = `
                    <div class="item-content">
                        <img src="${item.image_url}" alt="${item.item_name}" class="item-image">
                        <h3 class="item-name">${item.item_name}</h3>
                        <p class="item-description">${item.item_description}</p>
                        <p class="item-price">$${parseFloat(item.price).toFixed(2)}</p>
                        <div class="item-buttons">
                            <button class="view-details" data-id="${item.item_id}">View Details</button>
                            <button class="add-to-cart" data-id="${item.item_id}" data-name="${item.item_name}" data-price="${item.price}" data-image="${item.image_url}">Add to Cart</button>
                        </div>
                    </div>
                `;

                // Add event listeners
                const viewDetailsButton = itemDiv.querySelector('.view-details');
                viewDetailsButton.addEventListener('click', () => {
                    navigateToItem(item.item_id);
                });

                const addToCartButton = itemDiv.querySelector('.add-to-cart');
                addToCartButton.addEventListener('click', function() {
                    const itemId = this.getAttribute('data-id');
                    const itemName = this.getAttribute('data-name');
                    const itemPrice = parseFloat(this.getAttribute('data-price'));
                    const itemImage = this.getAttribute('data-image');
                    addToCart(itemId, itemName, itemPrice, itemImage);
                });

                itemsGrid.appendChild(itemDiv);
            });
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
            const cartItemsList = document.getElementById('cartItems');
            cartItemsList.innerHTML = '';

            cart.forEach(item => {
                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <img src="${item.image_url}" alt="${item.item_name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${item.item_name}</h4>
                        <p>$${parseFloat(item.price).toFixed(2)}</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-id="${item.item_id}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.item_id}">+</button>
                        </div>
                    </div>
                    <button class="remove-item" data-id="${item.item_id}">Remove</button>
                `;

                // Add event listeners for quantity controls
                const minusBtn = li.querySelector('.minus');
                const plusBtn = li.querySelector('.plus');
                
                minusBtn.addEventListener('click', () => updateQuantity(item.item_id, -1));
                plusBtn.addEventListener('click', () => updateQuantity(item.item_id, 1));

                // Add event listener for remove button
                const removeButton = li.querySelector('.remove-item');
                removeButton.addEventListener('click', () => removeFromCart(item.item_id));

                cartItemsList.appendChild(li);
            });
        }

        // Function to update item quantity
        async function updateQuantity(itemId, change) {
            if (!currentUserId) {
                alert('Please create a user first');
                return;
            }

            console.log('Updating quantity:', { itemId, change, currentUserId });

            const item = cart.find(item => item.item_id === itemId);
            if (!item) {
                console.error('Item not found in cart:', itemId);
                return;
            }

            const newQuantity = item.quantity + change;
            console.log('Current quantity:', item.quantity, 'New quantity:', newQuantity);

            if (newQuantity < 1) {
                console.log('Quantity would go below 1, removing item');
                removeFromCart(itemId);
                return;
            }

            try {
                console.log('Sending update request to server');
                const response = await fetch('/api/update-cart-quantity', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: currentUserId,
                        itemId: itemId,
                        quantity: newQuantity
                    })
                });

                console.log('Server response status:', response.status);
                const responseData = await response.json();
                console.log('Server response:', responseData);

                if (!response.ok) {
                    throw new Error('Failed to update quantity');
                }

                // Update local cart state
                item.quantity = newQuantity;
                console.log('Updated local cart state:', cart);

                // Update cart counter
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                document.getElementById('cartCounter').textContent = totalItems;

                // Update cart UI
                updateCartUI();

            } catch (error) {
                console.error('Error updating quantity:', error);
                alert('Failed to update quantity. Please try again.');
            }
        }

        // Function to add items to the users cart
        async function addToCart(itemId, itemName, itemPrice, itemImage) {
            if (!currentUserId) {
                alert('Please create a user first');
                return;
            }

            try {
                const response = await fetch('/api/add-to-cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: currentUserId,
                        itemId: itemId
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to add item to cart');
                }

                // Update local cart state
                const existingItem = cart.find(item => item.item_id === itemId);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        item_id: itemId,
                        item_name: itemName,
                        price: itemPrice,
                        image_url: itemImage,
                        quantity: 1
                    });
                }

                // Update cart counter
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                document.getElementById('cartCounter').textContent = totalItems;

                // Update cart UI
                updateCartUI();

            } catch (error) {
                console.error('Error adding to cart:', error);
                alert('Failed to add item to cart. Please try again.');
            }
        }

        // Function to remove items from the users cart
        async function removeFromCart(itemId) {
            if (!currentUserId) {
                alert('Please create a user first');
                return;
            }

            try {
                const response = await fetch('/api/cart_items', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: currentUserId,
                        itemId: itemId
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to remove item from cart');
                }

                // Update local cart state
                const itemIndex = cart.findIndex(item => item.item_id === itemId);
                if (itemIndex !== -1) {
                    cart.splice(itemIndex, 1);
                }

                // Update cart counter
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                document.getElementById('cartCounter').textContent = totalItems;

                // Update cart UI
                updateCartUI();
            } catch (error) {
                console.error('Error removing from cart:', error);
                alert('Failed to remove item from cart. Please try again.');
            }
        }


        // Initialize the items display on page load
        window.onload = fetchItems;

        // Attach event listeners
        function attachEventListeners() {
            // Toggle user form pop-up
            document.getElementById('userFormButton').addEventListener('click', function () {
                document.getElementById('userFormPopup').style.display = 'flex';
            });

            // Toggle login form pop-up
            document.getElementById('loginFormButton').addEventListener('click', function () {
                document.getElementById('loginFormPopup').style.display = 'flex';
            });

            // Close user form popup
            document.getElementById('closeUserForm').addEventListener('click', function () {
                document.getElementById('userFormPopup').style.display = 'none';
            });

            // Close login form popup
            document.getElementById('closeLoginForm').addEventListener('click', function () {
                document.getElementById('loginFormPopup').style.display = 'none';
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
                document.getElementById('userFormPopup').style.display = 'none';
                
                // Hide the login and create account buttons
                document.getElementById('loginFormButton').style.display = 'none';
                document.getElementById('userFormButton').style.display = 'none';
                
                // Display the username in the header
                const userDisplay = document.getElementById('userDisplay');
                userDisplay.textContent = username;
                
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

        // Handle login form submission
        document.getElementById('login-form').addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const email = document.getElementById('login-email').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email })
                });

                if (!response.ok) {
                    throw new Error('Failed to login');
                }

                const data = await response.json();
                currentUserId = data.userId;

                // Restore cart items from the server
                cart = data.cart || [];
                
                // Update cart counter
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                document.getElementById('cartCounter').textContent = totalItems;
                
                // Update cart UI
                updateCartUI();

                // Hide the login form
                document.getElementById('loginFormPopup').style.display = 'none';
                
                // Hide the login and create account buttons
                document.getElementById('loginFormButton').style.display = 'none';
                document.getElementById('userFormButton').style.display = 'none';
                
                // Display the username in the header
                const userDisplay = document.getElementById('userDisplay');
                userDisplay.textContent = username;

                // Show success message
                document.getElementById('login-feedback').textContent = 'Logged in successfully!';
                document.getElementById('login-feedback').style.color = 'var(--white)';
                
                // Clear the form
                document.getElementById('login-username').value = '';
                document.getElementById('login-email').value = '';
                
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('login-feedback').textContent = 'Error logging in. Please check your credentials and try again.';
                document.getElementById('login-feedback').style.color = 'var(--secondary-color)';
            }
        });

        // Search items
        async function searchItems() {
            const searchTerm = document.getElementById('searchInput').value;
            console.log('Search term:', searchTerm);

            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const items = await response.json();
                console.log('Search results:', items);

                const itemsGrid = document.getElementById('itemsGrid');
                itemsGrid.innerHTML = '';

                if (items.length === 0) {
                    itemsGrid.innerHTML = '<p>No items found.</p>';
                    return;
                }

                displayItems(items);

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

  