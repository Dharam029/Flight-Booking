require("dotenv").config();
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "flight_booking.db");

const createTables = async () => {
    const SQL = await initSqlJs();

    let db;
    if (fs.existsSync(dbPath)) {
        db = new SQL.Database(fs.readFileSync(dbPath));
        console.log("Database file found, loading...");
    } else {
        db = new SQL.Database();
        console.log("Creating new database...");
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS flights (
            flight_id INTEGER PRIMARY KEY AUTOINCREMENT,
            flight_number TEXT NOT NULL,
            source TEXT NOT NULL,
            destination TEXT NOT NULL,
            departure_time TEXT NOT NULL,
            arrival_time TEXT NOT NULL,
            capacity INTEGER NOT NULL,
            available_seats INTEGER NOT NULL,
            price REAL NOT NULL,
            status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'cancelled', 'deleted')),
            cancellation_message TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            flight_id INTEGER NOT NULL,
            passengers_count INTEGER NOT NULL,
            travel_class TEXT DEFAULT 'economy',
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled', 'cancel_requested')),
            cancellation_reason TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (flight_id) REFERENCES flights(flight_id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS passengers (
            passenger_id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL CHECK(gender IN ('male', 'female', 'other')),
            FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS payments (
            payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            payment_status TEXT DEFAULT 'paid' CHECK(payment_status IN ('paid', 'pending', 'failed')),
            payment_date TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
        )
    `);

    const adminCheck = db.exec("SELECT user_id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminCheck.length === 0 || adminCheck[0].values.length === 0) {
        const adminPassword = await bcrypt.hash("admin123", 12);
        db.run(
            "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'admin')",
            ["Administrator", "admin@skybook.com", adminPassword, "0000000000"]
        );
        console.log("Admin user created:");
        console.log("  Email: admin@skybook.com");
        console.log("  Password: admin123");
    } else {
        console.log("Admin user already exists");
    }

    const sampleFlights = db.exec("SELECT flight_id FROM flights LIMIT 1");
    if (sampleFlights.length === 0 || sampleFlights[0].values.length === 0) {
        const flights = [
            ["SK101", "New York", "Los Angeles", "2026-05-15 08:00:00", "2026-05-15 11:30:00", 180, 180, 299.99],
            ["SK202", "Los Angeles", "Chicago", "2026-05-15 14:00:00", "2026-05-15 20:00:00", 150, 150, 249.99],
            ["SK303", "Miami", "Seattle", "2026-05-16 09:30:00", "2026-05-16 14:30:00", 200, 200, 349.99],
            ["SK404", "Boston", "Denver", "2026-05-16 16:00:00", "2026-05-16 19:00:00", 120, 120, 199.99],
            ["SK505", "San Francisco", "Austin", "2026-05-17 11:00:00", "2026-05-17 16:00:00", 160, 160, 279.99],
        ];

        flights.forEach(f => {
            db.run(
                "INSERT INTO flights (flight_number, source, destination, departure_time, arrival_time, capacity, available_seats, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                f
            );
        });
        console.log("Sample flights added");
    }

    const regionalCheck = db.exec("SELECT flight_id FROM flights WHERE flight_number LIKE 'SK6%' LIMIT 1");
    if (regionalCheck.length === 0 || regionalCheck[0].values.length === 0) {
        const regionalFlights = [
            ["SK601", "Mumbai", "Delhi", "2026-06-10 06:30:00", "2026-06-10 08:45:00", 180, 180, 89.99],
            ["SK602", "Delhi", "Bangalore", "2026-06-10 10:00:00", "2026-06-10 12:45:00", 160, 160, 109.99],
            ["SK603", "Chennai", "Hyderabad", "2026-06-11 07:15:00", "2026-06-11 08:30:00", 150, 150, 79.99],
            ["SK604", "Mumbai", "Kolkata", "2026-06-11 14:00:00", "2026-06-11 16:30:00", 170, 170, 99.99],
            ["SK605", "Bangalore", "Goa", "2026-06-12 09:00:00", "2026-06-12 10:15:00", 120, 120, 69.99],
            ["SK606", "Delhi", "Kochi", "2026-06-12 18:00:00", "2026-06-12 21:00:00", 180, 180, 129.99],
            ["SK607", "Beijing", "Shanghai", "2026-06-10 08:00:00", "2026-06-10 10:15:00", 200, 200, 119.99],
            ["SK608", "Shanghai", "Guangzhou", "2026-06-11 11:30:00", "2026-06-11 13:45:00", 180, 180, 99.99],
            ["SK609", "Shenzhen", "Hong Kong", "2026-06-11 16:00:00", "2026-06-11 17:00:00", 140, 140, 59.99],
            ["SK610", "Beijing", "Chengdu", "2026-06-12 07:00:00", "2026-06-12 09:45:00", 190, 190, 139.99],
            ["SK611", "Shanghai", "Xi'an", "2026-06-13 13:00:00", "2026-06-13 15:30:00", 175, 175, 109.99],
            ["SK612", "Guangzhou", "Hangzhou", "2026-06-13 09:30:00", "2026-06-13 11:00:00", 160, 160, 89.99],
            ["SK613", "Kuala Lumpur", "Penang", "2026-06-10 07:00:00", "2026-06-10 08:00:00", 130, 130, 49.99],
            ["SK614", "Kuala Lumpur", "Langkawi", "2026-06-11 10:00:00", "2026-06-11 11:10:00", 120, 120, 54.99],
            ["SK615", "Penang", "Kota Kinabalu", "2026-06-12 12:00:00", "2026-06-12 14:30:00", 150, 150, 89.99],
            ["SK616", "Johor Bahru", "Kuala Lumpur", "2026-06-12 17:00:00", "2026-06-12 18:00:00", 110, 110, 39.99],
            ["SK617", "Kuala Lumpur", "Kuching", "2026-06-13 08:30:00", "2026-06-13 10:15:00", 140, 140, 74.99],
            ["SK618", "Mumbai", "Kuala Lumpur", "2026-06-14 23:00:00", "2026-06-15 05:30:00", 280, 280, 219.99],
            ["SK619", "Delhi", "Beijing", "2026-06-15 02:00:00", "2026-06-15 09:30:00", 300, 300, 349.99],
            ["SK620", "Shanghai", "Kuala Lumpur", "2026-06-15 14:00:00", "2026-06-15 19:30:00", 260, 260, 279.99],
            ["SK621", "Hong Kong", "Kuala Lumpur", "2026-06-16 09:00:00", "2026-06-16 13:00:00", 220, 220, 189.99],
            ["SK622", "Bangalore", "Singapore", "2026-06-16 11:00:00", "2026-06-16 14:30:00", 200, 200, 159.99],
            ["SK623", "Chennai", "Kuala Lumpur", "2026-06-17 06:00:00", "2026-06-17 10:30:00", 240, 240, 199.99],
            ["SK624", "Beijing", "Kuala Lumpur", "2026-06-17 16:00:00", "2026-06-17 22:30:00", 290, 290, 319.99],
        ];

        regionalFlights.forEach((f) => {
            db.run(
                "INSERT INTO flights (flight_number, source, destination, departure_time, arrival_time, capacity, available_seats, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                f
            );
        });
        console.log("Regional flights (India, China, Malaysia) added");
    }

    fs.writeFileSync(dbPath, db.export());
    db.close();

    console.log("\nDatabase setup complete!");
    console.log(`Database saved to: ${dbPath}`);
    console.log("\nTo run the server: cd backend && npm start");
    console.log("To run the frontend: cd frontend && npm run dev");
};

createTables().catch(console.error);
