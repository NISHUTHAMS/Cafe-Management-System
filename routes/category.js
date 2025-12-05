const express = require('express');
const connection = require('../connection');
const router = express.Router();

const auth = require('../services/authentication');
const { checkRole } = require('../services/checkRole');

// ADD CATEGORY
router.post('/add', auth.authenticateToken, checkRole, (req, res) => {
    const category = req.body;

    const query = "INSERT INTO category(name) VALUES(?)";
    connection.query(query, [category.name], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "Category Added Successfully" });
        } else {
            return res.status(500).json(err);
        }
    });
});

// GET CATEGORY
router.get('/get', auth.authenticateToken, (req, res) => {
    const query = "SELECT * FROM category ORDER BY name";

    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

// UPDATE CATEGORY
router.patch('/update', auth.authenticateToken, checkRole, (req, res) => {
    const category = req.body;

    const query = "UPDATE category SET name=? WHERE id=?";
    connection.query(query, [category.name, category.id], (err, results) => {
        if (!err) {
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Category not found" });
            }
            return res.status(200).json({ message: "Category updated successfully" });
        } else {
            return res.status(500).json(err);
        }
    });
});

module.exports = router;

