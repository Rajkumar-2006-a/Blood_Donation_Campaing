const db = require('../config/db');

// Get all camp requests
exports.getCampRequests = async (req, res) => {
    try {
        const [requests] = await db.query('SELECT * FROM camp_requests ORDER BY camp_date DESC');
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create camp request
exports.createCampRequest = async (req, res) => {
    const { institution_name, location, camp_date, contact_person } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO camp_requests (institution_name, location, camp_date, contact_person, status) VALUES (?, ?, ?, ?, ?)',
            [institution_name, location, camp_date, contact_person, 'Pending']
        );

        res.status(201).json({ message: 'Camp request submitted successfully', requestId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update camp request status (Admin only)
exports.updateCampStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await db.query(
            'UPDATE camp_requests SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({ message: 'Camp request status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
