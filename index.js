const express = require("express");
const app = express();

app.use(express.json());

// User Routes
const userRoutes = require("./routes/user");
app.use("/user", userRoutes);

// Category Routes
const categoryRoute = require('./routes/category');
app.use('/category', categoryRoute);

//Product Routes
const productRoute = require('./routes/product');
app.use('/product', productRoute);

//Bill Routes
const billRoute = require('./routes/bill');
app.use('/bill', billRoute);

//dashboard Routes
const dashboardRoute = require('./routes/dashboard');
app.use('/dashboard', dashboardRoute);



module.exports = app;
