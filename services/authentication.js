const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) return res.sendStatus(403);

        // ✅ Attach decoded token to req.user
        req.user = decoded;
        next();
    });
}

module.exports = { authenticateToken };
