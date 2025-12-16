const express = require('express');
const connection = require('../connection');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v1: uuidv1 } = require('uuid');
const auth = require('../services/authentication');

router.post('/generateReport', auth.authenticateToken, (req, res) => {
    const generatedUuid = uuidv1();
    const orderDetails = req.body;

    let productDetailsReport;
    try {
        productDetailsReport = typeof orderDetails.productDetails === "string"
            ? JSON.parse(orderDetails.productDetails)
            : orderDetails.productDetails;
    } catch (err) {
        return res.status(400).json({ message: "Invalid product details" });
    }

    const query = `
        INSERT INTO bill
        (name, uuid, email, contactnumber, paymentMethod, total, productDetails, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    connection.query(
        query,
        [
            orderDetails.name,
            generatedUuid,
            orderDetails.email,
            orderDetails.contactNumber,
            orderDetails.paymentMethod,
            orderDetails.total,
            JSON.stringify(productDetailsReport),
            req.user.email
        ],
        (err) => {
            if (err) return res.status(500).json(err);

           
            const pdfDir = path.join(__dirname, "../generated_pdf");
            if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

            const pdfPath = path.join(pdfDir, `${generatedUuid}.pdf`);

        
            const doc = new PDFDocument();
            const writeStream = fs.createWriteStream(pdfPath);
            doc.pipe(writeStream);

            doc.fontSize(20).text(`Bill - ${orderDetails.name}`, { underline: true });
            doc.moveDown();
            doc.fontSize(12).text(`Email: ${orderDetails.email}`);
            doc.text(`Contact Number: ${orderDetails.contactNumber}`);
            doc.text(`Payment Method: ${orderDetails.paymentMethod}`);
            doc.text(`Total Amount: ${orderDetails.total}`);
            doc.moveDown();
            doc.text('Products:', { underline: true });

            productDetailsReport.forEach((p, index) => {
                doc.text(
                    `${index + 1}. ${p.name} | Category: ${p.category} | Quantity: ${p.quantity} | Price: ${p.price} | Total: ${p.total}`
                );
            });

            doc.end();

            
            writeStream.on('finish', () => {
                return res.status(200).json({
                    uuid: generatedUuid,
                    message: "PDF generated successfully",
                    pdfPath
                });
            });

            writeStream.on('error', (err) => {
                return res.status(500).json({ message: "Error writing PDF", error: err });
            });
        }
    );
});

module.exports = router;



router.get('/getPdf/:uuid', auth.authenticateToken, (req, res) => {
    const uuid = req.params.uuid;

   
    const pdfPath = path.join(__dirname, "../generated_pdf", `${uuid}.pdf`);

   
    if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({ message: "PDF not found" });
    }

   
    res.contentType("application/pdf");

   
    const readStream = fs.createReadStream(pdfPath);
    readStream.pipe(res);
});



router.get('/getBills', auth.authenticateToken, (req, res) => {
    const query = `SELECT * FROM bill ORDER BY id DESC`;

    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        return res.status(200).json(results);
    });
});



router.get('/deleteBillById/:id', auth.authenticateToken, (req, res) => {
    const id = req.params.id;

    connection.query("DELETE FROM bill WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Bill not found" });
        }

        res.json({ message: "Bill deleted successfully", deletedId: id });
    });
});




module.exports = router;