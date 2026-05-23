require("dotenv").config();

module.exports = {
    jwtSecret: process.env.JWT_SECRET || "secret123",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
    port: process.env.PORT || 3000,
};
