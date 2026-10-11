CREATE DATABASE IF NOT EXISTS washwhiz;
USE washwhiz;

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    staff_id VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wash_presets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(80) NOT NULL,
    cycle VARCHAR(80) NOT NULL,
    temperature VARCHAR(50) NOT NULL,
    spin_speed VARCHAR(50) NOT NULL,
    detergent VARCHAR(120) NOT NULL,
    softener VARCHAR(120) NOT NULL,
    addons JSON,
    notes TEXT,
    price_per_kg DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wash_presets_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    staff_id INT NULL,
    service_type VARCHAR(80) NOT NULL,
    preset_id INT NULL,
    preset_name VARCHAR(120) NOT NULL,
    weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    items_count INT NOT NULL DEFAULT 0,
    special_instructions TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'received',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_paid TINYINT(1) NOT NULL DEFAULT 0,
    estimated_ready_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_stage_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    stage VARCHAR(50) NOT NULL,
    note TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_stage_orders FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

INSERT INTO staff (name, staff_id, email, password_hash, role)
VALUES (
    'Admin User',
    'WS-1001',
    'admin@washwhiz.com',
    '$2y$10$E1G4M1hj6WKCxW4P3QqWnObZnf0qF7dY1Q2H9rL6eM6za4/v7vfJm',
    'admin'
) ON DUPLICATE KEY UPDATE email = email;

INSERT INTO wash_presets (customer_id, name, category, cycle, temperature, spin_speed, detergent, softener, addons, notes, price_per_kg)
VALUES
    (NULL, 'Everyday Refresh', 'Daily Cottons', 'Normal', 'Warm', '800 RPM', 'Standard Laundry Detergent', 'Softener Blend', '["Fabric Softener","Extra Rinse"]', 'Balanced cleaning for general household garments.', 73.50),
    (NULL, 'Silk Care', 'Delicates and Silk', 'Delicate', 'Cold', '500 RPM', 'Delicate Silk Wash', 'Light Softener', '["Stain Treatment"]', 'Low agitation and gentle wash for delicate fabrics.', 88.00),
    (NULL, 'Bedding Rescue', 'Heavy Bedding', 'Heavy Duty', 'Hot', '900 RPM', 'Deep Cleaning Formula', 'Fabric Softener', '["Stain Treatment","Extra Rinse"]', 'For blankets, comforters, and larger bedding pieces.', 96.00),
    (NULL, 'Sport Recovery', 'Activewear Sport', 'Quick Wash', 'Warm', '700 RPM', 'Sport Detergent', 'No Softener', '["Odor Removal"]', 'Built for activewear and workout clothes.', 80.00),
    (NULL, 'Baby Soft', 'Hypoallergenic and Baby', 'Delicate', 'Warm', '600 RPM', 'Hypoallergenic Detergent', 'Fragrance-Free Softener', '["Hypoallergenic Boost"]', 'Gentle formula for baby items and sensitive clothing.', 92.50),
    (NULL, 'Executive Press', 'Executive and Formal', 'Normal', 'Cold', '600 RPM', 'Premium Gentle Detergent', 'Light Softener', '["Steam Finish"]', 'Designed for formalwear and pressed business clothing.', 95.00)
ON DUPLICATE KEY UPDATE name = VALUES(name);