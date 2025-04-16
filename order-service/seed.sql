-- Create food_menu table
CREATE TABLE IF NOT EXISTS food_menu (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create order_foods table (join table with quantity)
CREATE TABLE IF NOT EXISTS order_foods (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    food_menu_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (food_menu_id) REFERENCES food_menu(id) ON DELETE CASCADE
);

-- Insert sample food menu items
INSERT INTO food_menu (id, name, price, description) VALUES
    (UUID(), 'Margherita Pizza', 12.99, 'Classic tomato and mozzarella pizza'),
    (UUID(), 'Pepperoni Pizza', 14.99, 'Tomato sauce, mozzarella, and pepperoni'),
    (UUID(), 'Caesar Salad', 8.99, 'Romaine lettuce, croutons, parmesan, and Caesar dressing'),
    (UUID(), 'Garlic Bread', 4.99, 'Freshly baked bread with garlic butter'),
    (UUID(), 'Tiramisu', 6.99, 'Classic Italian dessert with coffee and mascarpone'); 