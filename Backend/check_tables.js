const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'blood_donation_db'
});

connection.connect();

connection.query('SHOW TABLES', (error, results) => {
    if (error) {
        console.error('Error fetching tables:', error);
    } else {
        console.log('Tables in database:', results);
    }
    connection.end();
});
