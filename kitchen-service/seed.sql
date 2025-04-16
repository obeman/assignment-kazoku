USE restoran;

-- Create the food_menu table if it doesn't exist
CREATE TABLE IF NOT EXISTS food_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clear existing data
TRUNCATE TABLE food_menu;

-- Insert seed data
INSERT INTO food_menu (name, description, price, category, available) VALUES
('Nasi Goreng', 'Fried rice with vegetables and egg', 25000, 'Main Course', true),
('Mie Goreng', 'Fried noodles with vegetables and egg', 20000, 'Main Course', true),
('Ayam Goreng', 'Fried chicken with rice', 30000, 'Main Course', true),
('Es Teh', 'Iced tea', 5000, 'Beverage', true),
('Es Jeruk', 'Orange juice', 8000, 'Beverage', true); 