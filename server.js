// Import required modules
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3001;

// Connect to MySQL Database
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'W6BjjngNf',
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

// Serve static HTML files
app.use(express.static(path.join(__dirname, 'public')));

// Route to retrieve all items from DB
app.get('/api/items', (req, res) => {
  connection.query('SELECT * FROM Items', (err, results) => {
      if (err) {
          console.error('Error fetching items:', err);
          return res.status(500).send(`Database query failed: ${err.message}`);
      }
      res.json(results);
  });
});


// Route for users creation
app.post('/api/users', (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: 'Username and Email are required.' });
  }

  connection.query(
    'INSERT INTO Users (username, email) VALUES (?, ?)',
    [username, email],
    (err, results) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ error: err.sqlMessage });
      }
      res.status(201).json({ message: 'User created!', userId: results.insertId });
    }
  );
});

// Start the server (outside route handlers)
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
