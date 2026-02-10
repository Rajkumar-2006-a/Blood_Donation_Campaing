const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Raj@2006', // User to fill this
    database: process.env.DB_NAME || 'blood_donation_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL Database');
        connection.release();
    }
});

module.exports = pool.promise();
