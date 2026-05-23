const bcrypt = require("bcryptjs");
const db = require("../config/db");

const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        const existing = await db.query("SELECT user_id FROM users WHERE email = ?", [email]);

        if (existing.length > 0) {
            return res.status(409).json({ message: "User with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await db.run(
            "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'user')",
            [name, email, hashedPassword, phone || null]
        );

        res.status(201).json({ message: "Registration successful. Please login." });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error." });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const users = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const jwt = require("jsonwebtoken");
        const config = require("../config");

        const token = jwt.sign(
            { id: user.user_id, role: user.role, name: user.name },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );

        res.json({
            message: "Login successful.",
            token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error." });
    }
};

const getProfile = async (req, res) => {
    try {
        const users = await db.query("SELECT user_id, name, email, phone, role FROM users WHERE user_id = ?", [req.user.id]);
        if (users.length === 0) return res.status(404).json({ message: "User not found." });
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};

module.exports = { register, login, getProfile };
