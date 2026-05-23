const db = require("../config/db");

const bookFlight = async (req, res) => {
    try {
        const { flight_id, passengers, travel_class, total_amount } = req.body;
        const user_id = req.user.id;

        if (!flight_id || !passengers || passengers.length === 0 || !travel_class || !total_amount) {
            return res.status(400).json({ message: "Flight ID, passengers, travel class, and total amount are required." });
        }

        const flights = await db.query("SELECT available_seats FROM flights WHERE flight_id = ? AND status = 'scheduled'", [flight_id]);
        if (flights.length === 0) {
            return res.status(404).json({ message: "Flight not found or not available." });
        }

        const available = flights[0].available_seats;
        if (available < passengers.length) {
            return res.status(400).json({ message: `Only ${available} seats available.` });
        }

        await db.run(
            "INSERT INTO bookings (user_id, flight_id, passengers_count, travel_class, total_amount, status) VALUES (?, ?, ?, ?, ?, 'confirmed')",
            [user_id, flight_id, passengers.length, travel_class, total_amount]
        );

        const bookingId = await db.getLastInsertId();

        for (const p of passengers) {
            await db.run(
                "INSERT INTO passengers (booking_id, name, age, gender) VALUES (?, ?, ?, ?)",
                [bookingId, p.name, p.age, p.gender]
            );
        }

        await db.run(
            "UPDATE flights SET available_seats = available_seats - ? WHERE flight_id = ?",
            [passengers.length, flight_id]
        );

        await db.run(
            "INSERT INTO payments (booking_id, amount, payment_status) VALUES (?, ?, 'paid')",
            [bookingId, total_amount]
        );

        res.status(201).json({ message: "Booking confirmed.", bookingId });
    } catch (error) {
        console.error("Book flight error:", error);
        res.status(500).json({ message: "Server error." });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const user_id = req.user.id;

        const bookings = await db.query(
            `SELECT b.*, f.flight_number, f.source, f.destination, f.departure_time, f.arrival_time, f.price, f.status AS flight_status, f.cancellation_message
             FROM bookings b
             JOIN flights f ON b.flight_id = f.flight_id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`,
            [user_id]
        );

        for (const b of bookings) {
            b.passengers = await db.query("SELECT name, age, gender FROM passengers WHERE booking_id = ?", [b.booking_id]);
        }

        res.json(bookings);
    } catch (error) {
        console.error("Get bookings error:", error);
        res.status(500).json({ message: "Error fetching bookings." });
    }
};

const requestCancellation = async (req, res) => {
    try {
        const { reason } = req.body;
        const { id } = req.params;
        const user_id = req.user.id;

        const result = await db.run(
            "UPDATE bookings SET status = 'cancel_requested', cancellation_reason = ? WHERE booking_id = ? AND user_id = ?",
            [reason, id, user_id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: "Booking not found." });
        }

        res.json({ message: "Cancellation request submitted." });
    } catch (error) {
        res.status(500).json({ message: "Database error." });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const bookings = await db.query(
            `SELECT b.*, f.flight_number, f.source, f.destination, u.name AS user_name, u.email AS user_email
             FROM bookings b
             JOIN flights f ON b.flight_id = f.flight_id
             JOIN users u ON b.user_id = u.user_id
             ORDER BY b.created_at DESC`
        );
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bookings." });
    }
};

const getCancelRequests = async (req, res) => {
    try {
        const requests = await db.query(
            `SELECT b.*, f.flight_number, f.source, f.destination, u.name AS user_name, u.email AS user_email
             FROM bookings b
             JOIN flights f ON b.flight_id = f.flight_id
             JOIN users u ON b.user_id = u.user_id
             WHERE b.status = 'cancel_requested'
             ORDER BY b.created_at DESC`
        );
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Database error." });
    }
};

const approveCancellation = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const bookings = await db.query("SELECT flight_id, passengers_count FROM bookings WHERE booking_id = ?", [bookingId]);
        if (bookings.length === 0) {
            return res.status(404).json({ message: "Booking not found." });
        }

        const { flight_id, passengers_count } = bookings[0];

        await db.run("UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?", [bookingId]);
        await db.run("UPDATE flights SET available_seats = available_seats + ? WHERE flight_id = ?", [passengers_count, flight_id]);

        res.json({ message: "Cancellation approved. Seats restored." });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};

const rejectCancellation = async (req, res) => {
    try {
        const result = await db.run(
            "UPDATE bookings SET status = 'confirmed' WHERE booking_id = ? AND status = 'cancel_requested'",
            [req.params.bookingId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: "Request not found." });
        }

        res.json({ message: "Cancellation request rejected." });
    } catch (error) {
        res.status(500).json({ message: "Database error." });
    }
};

module.exports = { bookFlight, getMyBookings, requestCancellation, getAllBookings, getCancelRequests, approveCancellation, rejectCancellation };
