const express = require('express');
const app = express();
const port = 3001;
const bodyParser = require('body-parser');
const mysql = require('mysql2'); // Use mysql2 instead of mysql
const path = require('path');

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
  console.log('Search term:', searchTerm); // Log the search term
  const query = `
    SELECT * FROM items
    WHERE item_name LIKE ?
  `;
  connection.query(query, [`%${searchTerm}%`], (err, results) => {
    if (err) {
      console.error('Error searching items:', err);
      return res.status(500).json({ error: 'Database error.', details: err.message });
    }
    console.log('Search results:', results); // Log the search results
    res.json(results);
  });
});


  // Check if the item already exists in the cart
  // Add item to cart endpoint
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
});

// Fetch cart items
app.get('/api/cart/:userId', (req, res) => {
  const userId = req.params.userId;
  const fetchCartQuery = 'SELECT * FROM cart WHERE user_id = ?';
  connection.query(fetchCartQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching cart items:', err);
      return res.status(500).json({ error: 'Database error.' });
    }
    res.json(results);
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