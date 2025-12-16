const express = require('express');
const connection = require('../connection');
const router = express.Router();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');


router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let product = req.body;

    const query = "INSERT INTO product (name, categoryId, description, price, status) VALUES (?, ?, ?, ?, 'true')";

    connection.query(query,
        [product.name, product.categoryId, product.description, product.price],
        (err, results) => {
            if (!err) {
                return res.status(200).json({ message: "Product Added Successfully." });
            } else {
                return res.status(500).json(err);
            }
        }
    );
});



router.get('/get', auth.authenticateToken, (req, res) => {
    const query = `
        SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.status,
            c.id AS categoryId,
            c.name AS categoryName
        FROM product AS p
        INNER JOIN category AS c 
        ON p.categoryId = c.id
    `;

    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

router.get('/getByCategory/:id', auth.authenticateToken, (req, res) => {
    const id = req.params.id;
    var query = "Select id,name from product where categoryId=? and status='true'";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        }
        else {
            return res.status(500).json(err);
        }
    })

})

router.get('/getBy/:id', auth.authenticateToken, (req, res) => {
    const id = req.params.id;
    const query = "SELECT * FROM product WHERE id = ?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});


router.patch('/update/:id', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const id = req.params.id;
    const product = req.body;
    const query = `UPDATE product SET name = ?, categoryId = ?, description = ?, price = ?, status = ?
        WHERE id = ?`;
    connection.query(query, [product.name, product.categoryId, product.description, product.price, product.status, id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }
           if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Product not found" });
            }

            return res.status(200).json({ message: "Product updated successfully" });
        }
    );
});


router.delete('/delete/:id', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const id = req.params.id;
    const query = "DELETE FROM product WHERE id = ?";
    connection.query(query, [id], (err, result) => {
    if (err) {
        return res.status(500).json(err);
        }
    if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: "Product deleted successfully" });
    });
});


router.patch('/statusupdate/:id', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const id = req.params.id;
    const { status } = req.body; 

    if (!status) {
        return res.status(400).json({ message: "Status is required" });
    }

    const query = "UPDATE product SET status = ? WHERE id = ?";

    connection.query(query, [status, id], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: `Product status updated  successfully` });
    });
});


module.exports = router;