const express = require("express");
const app = express();

app.use(express.json());

// User Routes
const userRoutes = require("./routes/user");
app.use("/user", userRoutes);

// Category Routes
const categoryRoute = require('./routes/category');
app.use('/category', categoryRoute);

module.exports = app;
