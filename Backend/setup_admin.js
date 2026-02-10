const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'blood_donation_db'
};

async function setupAdmin() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log("Connected to database...");

        const email = 'admin@test.com';
        const password = 'admin123'; // Default admin password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if user exists
        const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            // Update existing user
            console.log("User exists. Updating to Admin...");

            // Note: 'role' column might not exist if using pure flags, but we added it in schema sync just in case? 
            // Actually schema sync was: role ENUM... wait, user schema had is_admin/is_donor but NO role column in the Create Table 2.
            // Let's re-read user schema.
            // User schema: "is_donor BOOLEAN, is_admin BOOLEAN". NO 'role' column. 
            // My schema sync script ADDED 'role' probably? No, let's check db_schema_sync.js again.
            // db_schema_sync.js used the USER PROVIDED schema which DOES NOT have 'role'.
            // Wait, if it doesn't have 'role', my authController uses 'role' in INSERT? 
            // My updated authController INSERTs `(..., is_donor, is_admin)`. Correct.
            // But `inventoryController` select query? 
            // Let's stick to update flags.

            await connection.query(
                'UPDATE users SET password = ?, is_admin = 1, is_donor = 0 WHERE email = ?',
                [hashedPassword, email]
            );
        } else {
            // Create new admin
            console.log("Creating new Admin user...");
            await connection.query(
                'INSERT INTO users (name, email, password, blood_group, location, contact, is_admin, is_donor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                ['Admin User', email, hashedPassword, 'O+', 'Headquarters', '0000000000', 1, 0]
            );
        }

        console.log("\nSuccess! Admin account setup complete.");
        console.log("---------------------------------------");
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log("---------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error('Admin Setup failed:', error);
        process.exit(1);
    }
}

setupAdmin();
