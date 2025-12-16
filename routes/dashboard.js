const express = require('express');
const connection = require('../connection');
const router = express.Router();
var auth =require('../services/authentication')

router.get('/details', auth.authenticateToken, (req, res) => {

    var categoryCount;
    var productCount;
    var billCount;
    var totalRevenue;


    var query = "select count(id) as categoryCount from category";
    connection.query(query, (err, results) => {
        if (!err) {
            categoryCount = results[0].categoryCount;
        } else {
            return res.status(500).json(err);
        }
    });

  
    var query = "select count(id) as productCount from product";
    connection.query(query, (err, results) => {
        if (!err) {
            productCount = results[0].productCount;
        } else {
            return res.status(500).json(err);
        }
    });

  
    var query = "select count(id) as billCount from bill";
    connection.query(query, (err, results) => {
        if (!err) {
            billCount = results[0].billCount;
        } else {
            return res.status(500).json(err);
        }
    });

  
    var query = "select sum(total) as totalRevenue from bill";
    connection.query(query, (err, results) => {
        if (!err) {
            totalRevenue = results[0].totalRevenue;

           
            return res.status(200).json({
                category: categoryCount,
                product: productCount,
                bill: billCount,
                revenue: totalRevenue
            });
        } else {
            return res.status(500).json(err);
        }
    });
});

module.exports = router;