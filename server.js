const express = require('express');
const app = express();
const port = 3002;
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const cors = require('cors');
app.use(cors());

// Connect to MySQL Database with retry
function connectWithRetry(attempt = 1) {
  const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'W6BjjngNf',
    database: 'webpage'
  };
  
  console.log('Attempting to connect to local MySQL database with config:', {
    ...dbConfig,
    password: '********' // Don't log the actual password
  });

  const connection = mysql.createConnection(dbConfig);

  // Add connection state logging
  connection.on('connect', () => {
    console.log('Database connection established');
  });

  connection.on('end', () => {
    console.log('Database connection ended');
  });

  connection.on('error', (err) => {
    console.error('Database connection error:', err);
  });

  connection.connect((err) => {
    if (err) {
      console.error(`Error connecting to the database (attempt ${attempt}):`, err);
      if (attempt < 5) {
        console.log(`Retrying in 5 seconds... (${attempt}/5)`);
        setTimeout(() => connectWithRetry(attempt + 1), 5000);
      } else {
        console.error('Max retries reached. Could not connect to database.');
      }
      return;
    }
    console.log('Successfully connected to database:', dbConfig.database);
  });

  return connection;
}

const connection = connectWithRetry();

// Add error handler for database connection
connection.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed. Attempting to reconnect...');
    connection = connectWithRetry();
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

// Parse JSON bodies
app.use(express.json());

// Create a new user
app.post('/api/users', (req, res) => {
  const { username, email } = req.body;
  console.log('Creating new user:', { username, email });
  
  // Check connection state before query
  if (connection.state === 'disconnected') {
    console.log('Connection is disconnected, attempting to reconnect...');
    connection = connectWithRetry();
  }
  
  const query = 'INSERT INTO webpage.Users (username, email) VALUES (?, ?)';
  console.log('Executing query:', query, 'with values:', [username, email]);
  
  connection.query(query, [username, email], (err, results) => {
    if (err) {
      console.error('Error creating user:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Connection lost, attempting to reconnect...');
        connection = connectWithRetry();
      }
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    const userId = results.insertId;
    console.log('Successfully created user with ID:', userId);
    res.json({ userId: results.insertId });
  });
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Fetch items
app.get('/api/items', (req, res) => {
  console.log('Fetching items from database...');
  const query = 'SELECT * FROM webpage.Items';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching items:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    console.log(`Successfully fetched ${results.length} items`);
    res.json(results);
  });
});

// Search items
app.get('/api/search', (req, res) => {
  const searchTerm = req.query.q;

  // Query to search for items by name or tag
  const searchQuery = `
    SELECT * FROM webpage.Items
    WHERE item_name LIKE ? OR tags LIKE ?
  `;

  const searchValue = `%${searchTerm}%`; // Add wildcards for partial matching
  connection.query(searchQuery, [searchValue, searchValue], (err, results) => {
    if (err) {
      console.error('Error searching items:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    res.json(results);
  });
});

//Fetch item details by ID
app.get('/api/items/:id', (req, res) => {
  const itemId = req.params.id;

  const query = 'SELECT * FROM webpage.Items WHERE item_id = ?';
  connection.query(query, [itemId], (err, results) => {
    if (err) {
      console.error('Error fetching item details:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    res.json(results[0]);
  });
});


// Add item to cart
app.post('/api/add-to-cart', (req, res) => {
  const { userId, itemId } = req.body;
  console.log('Received add-to-cart request:', { userId, itemId });

  // First, check if the user exists
  const checkUserQuery = 'SELECT user_id FROM webpage.Users WHERE user_id = ?';
  console.log('Checking user existence with query:', checkUserQuery, 'and userId:', userId);
  
  connection.query(checkUserQuery, [userId], (err, userResults) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ error: 'Database error checking user: ' + err.message });
    }

    console.log('User check results:', userResults);

    if (userResults.length === 0) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found. Please log in again.' });
    }

    // User exists, now check if cart exists
    const checkCartQuery = 'SELECT cart_id FROM webpage.cart WHERE user_id = ?';
    console.log('Checking cart existence with query:', checkCartQuery, 'and userId:', userId);
    
    connection.query(checkCartQuery, [userId], (err, cartResults) => {
      if (err) {
        console.error('Error checking cart:', err);
        return res.status(500).json({ error: 'Database error checking cart: ' + err.message });
      }

      console.log('Cart check results:', cartResults);

      let cartId;
      if (cartResults.length === 0) {
        // Create a new cart if it doesn't exist
        const createCartQuery = 'INSERT INTO webpage.cart (user_id) VALUES (?)';
        console.log('Creating new cart with query:', createCartQuery, 'and userId:', userId);
        
        connection.query(createCartQuery, [userId], (err, result) => {
          if (err) {
            console.error('Error creating cart:', err);
            return res.status(500).json({ error: 'Database error creating cart: ' + err.message });
          }
          cartId = result.insertId;
          console.log('Created new cart with ID:', cartId);
          
          // Now that we have a cart, add the item
          addItemToCart(cartId, itemId, res);
        });
      } else {
        cartId = cartResults[0].cart_id;
        console.log('Found existing cart with ID:', cartId);
        
        // Add the item to the existing cart
        addItemToCart(cartId, itemId, res);
      }
    });
  });
});

// Helper function to add an item to the cart
function addItemToCart(cartId, itemId, res) {
  if (!cartId) {
    console.error('No cart ID provided');
    return res.status(500).json({ error: 'No cart ID available' });
  }

  console.log('Adding item to cart:', { cartId, itemId });
  
  // First check if the item exists in the cart
  const checkItemQuery = 'SELECT * FROM webpage.cart_items WHERE cart_id = ? AND item_id = ?';
  console.log('Checking if item exists in cart with query:', checkItemQuery, 'and values:', [cartId, itemId]);
  
  connection.query(checkItemQuery, [cartId, itemId], (err, results) => {
    if (err) {
      console.error('Error checking cart items:', err);
      return res.status(500).json({ error: 'Database error checking cart items: ' + err.message });
    }

    console.log('Item check results:', results);

    if (results.length > 0) {
      // Item exists, increment quantity
      const updateQuery = 'UPDATE webpage.cart_items SET quantity = quantity + 1 WHERE cart_id = ? AND item_id = ?';
      console.log('Updating item quantity with query:', updateQuery, 'and values:', [cartId, itemId]);
      
      connection.query(updateQuery, [cartId, itemId], (err) => {
        if (err) {
          console.error('Error updating cart item:', err);
          return res.status(500).json({ error: 'Database error updating cart item: ' + err.message });
        }
        console.log('Successfully updated item quantity');
        res.json({ message: 'Item quantity updated in cart.' });
      });
    } else {
      // Item doesn't exist, add new entry
      const insertQuery = 'INSERT INTO webpage.cart_items (cart_id, item_id, quantity) VALUES (?, ?, ?)';
      console.log('Adding new item to cart with query:', insertQuery, 'and values:', [cartId, itemId, 1]);
      
      connection.query(insertQuery, [cartId, itemId, 1], (err) => {
        if (err) {
          console.error('Error adding to cart:', err);
          return res.status(500).json({ error: 'Database error adding to cart: ' + err.message });
        }
        console.log('Successfully added new item to cart');
        res.json({ message: 'Item added to cart.' });
      });
    }
  });
}

// Remove items from cart
app.delete('/api/cart_items', (req, res) => {
  const { userId, itemId } = req.body;

  if (!userId || !itemId) {
      return res.status(400).json({ error: 'Missing userId or itemId.' });
  }

  // Step 1: Get the cart_id for the user
  const getCartIdQuery = 'SELECT cart_id FROM webpage.cart WHERE user_id = ?';
  connection.query(getCartIdQuery, [userId], (err, results) => {
      if (err) {
          console.error('Error fetching cart_id:', err);
          return res.status(500).json({ error: 'Database error.' });
      }

      if (results.length === 0) {
          console.error('Cart not found for user:', userId);
          return res.status(404).json({ error: 'Cart not found for the user.' });
      }

      const cartId = results[0].cart_id; // Retrieve the cart_id
      console.log(`Found cart_id: ${cartId} for user_id: ${userId}`);

      // Step 2: Delete the item from the cart_items table
      const deleteItemQuery = 'DELETE FROM webpage.cart_items WHERE cart_id = ? AND item_id = ?';
      connection.query(deleteItemQuery, [cartId, itemId], (err, results) => {
          if (err) {
              console.error('Error removing item from cart:', err);
              return res.status(500).json({ error: 'Database error.' });
          }

          if (results.affectedRows > 0) {
              console.log(`Item with item_id: ${itemId} removed from cart_id: ${cartId}`);
              res.json({ message: 'Item removed from cart.' });
          } else {
              console.error(`Item with item_id: ${itemId} not found in cart_id: ${cartId}`);
              res.status(404).json({ error: 'Item not found in cart.' });
          }
      });
  });
});

  // Serve the index.html file for the root URL
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });