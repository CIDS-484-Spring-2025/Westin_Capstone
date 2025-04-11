const express = require('express');
const app = express();
const port = 3002;
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const cors = require('cors');
app.use(cors());

// Connect to MySQL Database
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root', // Use your MySQL username
  password: 'W6BjjngNf', // Use your MySQL password
  database: 'webpage'
});

connection.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Parse JSON bodies
app.use(express.json());

// Create a new user
app.post('/api/users', (req, res) => {
  const { username, email } = req.body;
  const query = 'INSERT INTO users (username, email) VALUES (?, ?)';
  connection.query(query, [username, email], (err, results) => {
    if (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Database error.' });
    }
    const userId = results.insertId;
    res.json({ userId: results.insertId });
  });
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Fetch items
app.get('/api/items', (req, res) => {
  const query = 'SELECT * FROM items';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching items:', err);
      return res.status(500).json({ error: 'Database error.' });
    }
    res.json(results);
  });
});

// Search items
app.get('/api/search', (req, res) => {
  const searchTerm = req.query.q;

  // Query to search for items by name or tag
  const searchQuery = `
    SELECT * FROM items
    WHERE item_name LIKE ? OR tags LIKE ?
  `;

  const searchValue = `%${searchTerm}%`; // Add wildcards for partial matching
  connection.query(searchQuery, [searchValue, searchValue], (err, results) => {
    if (err) {
      console.error('Error searching items:', err);
      return res.status(500).json({ error: 'Database error.' });
    }

    res.json(results);
  });
});

//Fetch item details by ID
app.get('/api/items/:id', (req, res) => {
  const itemId = req.params.id;

  const query = 'SELECT * FROM items WHERE item_id = ?';
  connection.query(query, [itemId], (err, results) => {
    if (err) {
      console.error('Error fetching item details:', err);
      return res.status(500).json({ error: 'Database error.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    res.json(results[0]);
  });
});


/* Check if the item already exists in the cart
   Add item to cart endpoint 
app.post('/api/cart', (req, res) => {
  const { userId, itemId } = req.body;
  const checkCartQuery = 'SELECT * FROM cart WHERE user_id = ? AND item_id = ?';
  connection.query(checkCartQuery, [userId, itemId], (err, results) => {
    if (err) {
      console.error('Error checking cart:', err);
      return res.status(500).json({ error: 'Database error.' });
    }

    if (results.length > 0) {
      // Item exists, increment the quantity
      const updateQuery = 'UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND item_id = ?';
      connection.query(updateQuery, [userId, itemId], (err, results) => {
        if (err) {
          console.error('Error updating cart:', err);
          return res.status(500).json({ error: 'Database error.' });
        }
        res.json({ message: 'Item quantity updated in cart.' });
      });
    } else {
      // Item does not exist, add a new entry
      const insertQuery = 'INSERT INTO cart (user_id, item_id, quantity) VALUES (?, ?, 1)';
      connection.query(insertQuery, [userId, itemId], (err, results) => {
        if (err) {
          console.error('Error adding to cart:', err);
          return res.status(500).json({ error: 'Database error.' });
        }
        res.json({ message: 'Item added to cart.' });
      });
    }
  });
});  */

// Add item to cart
app.post('/api/add-to-cart', (req, res) => {
  const { userId, itemId } = req.body;

  // Step 1: Check if the user already has a cart
  const getCartQuery = 'SELECT cart_id FROM cart WHERE user_id = ?';
  connection.query(getCartQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching cart:', err);
      return res.status(500).json({ error: 'Database error.' });
    }

    let cartId;

    if (results.length > 0) {
      // Cart exists, get the cart_id
      cartId = results[0].cart_id;
    } else {
      // No cart exists, create a new cart
      const createCartQuery = 'INSERT INTO cart (user_id) VALUES (?)';
      connection.query(createCartQuery, [userId], (err, results) => {
        if (err) {
          console.error('Error creating cart:', err);
          return res.status(500).json({ error: 'Database error.' });
        }
        cartId = results.insertId; // Get the newly created cart_id
        addItemToCart(cartId, itemId, res); // Proceed to add the item
      });
      return;
    }

    // Step 2: Add the item to the cart
    addItemToCart(cartId, itemId, res);
  });
});

// Helper function to add an item to the cart
function addItemToCart(cartId, itemId, res) {
  const checkItemQuery = 'SELECT * FROM cart_items WHERE cart_id = ? AND item_id = ?';
  connection.query(checkItemQuery, [cartId, itemId], (err, results) => {
    if (err) {
      console.error('Error checking cart items:', err);
      return res.status(500).json({ error: 'Database error.' });
    }

    if (results.length > 0) {
      // Item exists, increment the quantity
      const updateQuery = 'UPDATE cart_items SET quantity = quantity + 1 WHERE cart_id = ? AND item_id = ?';
      connection.query(updateQuery, [cartId, itemId], (err, results) => {
        if (err) {
          console.error('Error updating cart item:', err);
          return res.status(500).json({ error: 'Database error.' });
        }
        res.json({ message: 'Item quantity updated in cart.' });
      });
    } else {
      // Item does not exist, add a new entry
      const insertQuery = 'INSERT INTO cart_items (cart_id, item_id, quantity) VALUES (?, ?, 1)';
      connection.query(insertQuery, [cartId, itemId], (err, results) => {
        if (err) {
          console.error('Error adding to cart:', err);
          return res.status(500).json({ error: 'Database error.' });
        }
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
  const getCartIdQuery = 'SELECT cart_id FROM cart WHERE user_id = ?';
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
      const deleteItemQuery = 'DELETE FROM cart_items WHERE cart_id = ? AND item_id = ?';
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