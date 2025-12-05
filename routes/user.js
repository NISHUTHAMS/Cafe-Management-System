const express = require("express");
const connection = require("../connection");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");

// Import middleware
const auth = require("../services/authentication");
const checkRole = require("../services/checkRole");

// -------------------- TRANSPORTER --------------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// -------------------- SIGNUP --------------------
router.post("/signup", (req, res) => {
  const user = req.body;

  const query = "SELECT email FROM user WHERE email=?";
  connection.query(query, [user.email], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length > 0) {
      return res.status(400).json({ message: "Email Already Exists" });
    }

    const insertQuery = `
      INSERT INTO user(name, contactNumber, email, password, status, role)
      VALUES (?, ?, ?, ?, 'false', 'user')
    `;

    connection.query(
      insertQuery,
      [user.name, user.contactNumber, user.email, user.password],
      (err) => {
        if (err) return res.status(500).json(err);

        return res.status(200).json({ message: "Successfully Registered" });
      }
    );
  });
});

// -------------------- LOGIN --------------------
router.post("/login", (req, res) => {
  const user = req.body;

  const query = "SELECT email, password, role, status FROM user WHERE email=?";
  connection.query(query, [user.email], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0 || results[0].password !== user.password) {
      return res.status(401).json({ message: "Incorrect Username or Password" });
    }

    if (results[0].status === "false") {
      return res.status(401).json({ message: "Wait for Admin Approval" });
    }

    const payload = { email: results[0].email, role: results[0].role };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, {
      expiresIn: "8h",
    });

    return res.status(200).json({ token: accessToken });
  });
});

// -------------------- FORGOT PASSWORD --------------------
router.post("/forgotPassword", (req, res) => {
  const emailInput = req.body.email?.trim().toLowerCase();

  if (!emailInput) {
    return res.status(400).json({ message: "Email is required" });
  }

  const query = "SELECT email, password FROM user WHERE LOWER(email) = ?";
  connection.query(query, [emailInput], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: "Email does not exist" });
    }

    const user = results[0];

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password by Cafe Management System",
      html: `
        <p><b>Your login details for Cafe Management System</b></p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Password:</b> ${user.password}</p>
        <p><a href="http://localhost:4200/user/login">Click here to Login</a></p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: "Email could not be sent", error: error.toString() });
      }

      return res.status(200).json({ message: "Password sent successfully to your email" });
    });
  });
});

// -------------------- GET ALL USERS --------------------
router.get("/get", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  connection.query(
    "SELECT id, name, email, contactNumber, status FROM user WHERE role='user'",
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
});

// -------------------- UPDATE USER STATUS --------------------
router.patch("/update", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  const user = req.body;
  const query = "UPDATE user SET status=? WHERE id=?";

  connection.query(query, [user.status, user.id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User ID does not exist" });
    }
    return res.status(200).json({ message: "User updated successfully" });
  });
});

// -------------------- CHECK TOKEN --------------------
router.get("/checkToken", auth.authenticateToken, (req, res) => {
  return res.status(200).json({ message: "true" });
});

// -------------------- CHANGE PASSWORD --------------------
router.post("/changePassword", auth.authenticateToken, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const email = req.user.email;

  const query = "SELECT password FROM user WHERE email=? AND password=?";
  connection.query(query, [email, oldPassword], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    const updateQuery = "UPDATE user SET password=? WHERE email=?";
    connection.query(updateQuery, [newPassword, email], (err) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: "Password updated successfully" });
    });
  });
});

module.exports = router;
