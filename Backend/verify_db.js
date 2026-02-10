const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'blood_donation_db'
});

connection.connect((err) => {
    if (err) {
        console.error('Connection Failed:', err.message);
        process.exit(1);
    }
    console.log('Database Connection Successful!');
    connection.end();
});
