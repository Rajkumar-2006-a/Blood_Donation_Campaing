const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, email, password, role, blood_group, phone, city } = req.body;

    try {
        // Check if user exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Map frontend fields to DB fields
        const is_donor = role === 'donor' ? 1 : 0;
        const is_admin = role === 'admin' ? 1 : 0;

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, blood_group, location, contact, is_donor, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, blood_group, city, phone, is_donor, is_admin]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message, sqlMessage: error.sqlMessage });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Determine role from flags
        let role = 'recipient';
        if (user.is_admin) role = 'admin';
        else if (user.is_donor) role = 'donor';

        // Create Token
        const token = jwt.sign({ id: user.id, role: role }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: role,
                blood_group: user.blood_group,
                city: user.location, // Map back for frontend
                phone: user.contact
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, blood_group, location as city, contact as phone, is_donor, is_admin FROM users WHERE is_admin = 0');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
