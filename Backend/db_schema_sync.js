const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'blood_donation_db',
    multipleStatements: true
};

// User provided schema + Inventory table
const schema = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    blood_group VARCHAR(5),
    location VARCHAR(100),
    contact VARCHAR(15),
    is_donor BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Camp Requests Table (User provided)
CREATE TABLE IF NOT EXISTS camp_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institution_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    camp_date DATE NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending'
);

-- Inventory Table (kept for feature)
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

async function initDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.query(schema);
        console.log('Database Schema (User Aligned) Synced successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Schema Sync failed:', error);
        process.exit(1);
    }
}

initDB();
