require("dotenv").config();
const express = require("express");
const cors = require("cors");
const config = require("./src/config");
const setupRoutes = require("./src/routes");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupRoutes(app);

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error." });
});

app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});
