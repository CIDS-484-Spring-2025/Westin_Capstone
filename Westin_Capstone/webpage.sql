-- Create the database
CREATE DATABASE webpage;

-- Create the Items table
CREATE TABLE Items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(2083),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USER TABLE
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for each user
    username VARCHAR(50) NOT NULL UNIQUE, -- Unique username for the user
    email VARCHAR(100) NOT NULL UNIQUE, -- Unique email address
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp for account creation
);

Create Table cart_items (
    cart_item_id INT Auto_Increment Primary Key,
    cart_id Int Not Null,
    item_id Int Not Null,
    quantity Int Default 1,
    Foreign Key (cart_id) References cart (cart_id),
    Foreign Key (item_id) References items (item_id)
);

Create Table cart (
    cart_id Int Auto_Increment Primary Key,
    user_id Int Not Null,
    created_at Timestamp Default Current_Timestamp,
    Foreign Key (user_id) References users (user_id)
);