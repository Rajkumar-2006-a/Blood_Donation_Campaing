const express = require('express');
const router = express.Router();
const { getCampRequests, createCampRequest, updateCampStatus } = require('../controllers/campController');

router.get('/', getCampRequests);
router.post('/', createCampRequest);
router.put('/:id', updateCampStatus);

module.exports = router;
