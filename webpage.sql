-- Create the database
CREATE DATABASE webpage;

USE webpage;

-- Create the Items table
CREATE TABLE Items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(2083),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO Items (item_name, item_description, price, image_url)
VALUES
('Wireless Headphones', 'High-quality noise-canceling wireless headphones.', 199.99, 'https://d1ncau8tqf99kp.cloudfront.net/converted/110590_original_local_1200x1050_v3_converted.webp'),
('Gaming Mouse', 'Ergonomic mouse with customizable buttons and RGB lighting.', 49.99, 'https://m.media-amazon.com/images/I/718b9wK3eaL.jpg'),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with blue switches.', 129.99, 'https://cdn.mos.cms.futurecdn.net/CxxpjpbaHLt6X2NC8rTa9E-1200-80.jpg'),
('4K Monitor', '32-inch 4K UHD monitor with vibrant colors.', 299.99, 'https://www.bhphotovideo.com/images/fb/hp_8y2k9aa_aba_32_4k_ultra_hd_1814579.jpg');

-- USER TABLE
CREATE TABLE Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for each user
  username VARCHAR(50) NOT NULL UNIQUE, -- Unique username for the user
  email VARCHAR(100) NOT NULL UNIQUE, -- Unique email address
  password VARCHAR(255) NOT NULL, -- Password (should be stored in hashed format)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp for account creation
);

-- CART TABLE
CREATE TABLE Cart (
  cart_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique cart entry identifier
  user_id INT NOT NULL, -- Foreign key referencing Users
  item_id INT NOT NULL, -- Foreign key referencing Items
  quantity INT DEFAULT 1, -- Number of items selected
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when item is added to cart
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE
);