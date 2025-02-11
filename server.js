
// Import required modules
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

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

// Serve static HTML files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get items from the database
app.get('/api/items', (req, res) => {
    connection.query('SELECT * FROM webpage.Items', (err, results) => {
      if (err) {
        return res.status(500).send('Database query failed.');
      }
      res.json(results);
    });
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });



/************************************************************************************************************************************************************************************
// Define a simple route
app.get('/', (req, res) => {
  connection.query('SELECT * FROM webpage.Items', (err, results) => {
    if (err) {
      return res.status(500).send('Database query failed.');
    }
    res.json(results);
  });
});
************************************************************************************************************************************************************************************/
