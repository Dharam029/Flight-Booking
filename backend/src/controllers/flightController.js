const db = require("../config/db");

const addFlight = async (req, res) => {
    try {
        const { flight_number, source, destination, departure_time, arrival_time, capacity, price } = req.body;

        if (!flight_number || !source || !destination || !departure_time || !arrival_time || !capacity || !price) {
            return res.status(400).json({ message: "All fields are required." });
        }

        await db.run(
            `INSERT INTO flights (flight_number, source, destination, departure_time, arrival_time, capacity, available_seats, price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
            [flight_number, source, destination, departure_time, arrival_time, capacity, capacity, price]
        );

        res.status(201).json({ message: "Flight added successfully." });
    } catch (error) {
        console.error("Add flight error:", error);
        res.status(500).json({ message: "Server error." });
    }
};

const getAllFlights = async (req, res) => {
    try {
        const flights = await db.query(
            `SELECT * FROM flights
             WHERE status = 'scheduled'
             ORDER BY departure_time ASC`
        );
        res.json(flights);
    } catch (error) {
        res.status(500).json({ message: "Error fetching flights." });
    }
};

const getFlightById = async (req, res) => {
    try {
        const flights = await db.query("SELECT * FROM flights WHERE flight_id = ? AND status != 'deleted'", [req.params.id]);
        if (flights.length === 0) return res.status(404).json({ message: "Flight not found." });
        res.json(flights[0]);
    } catch (error) {
        res.status(500).json({ message: "Database error." });
    }
};

const searchFlights = async (req, res) => {
    try {
        const source = (req.query.source || "").trim();
        const destination = (req.query.destination || "").trim();
        const { date } = req.query;

        if (!source && !destination) {
            const flights = await db.query(
                "SELECT * FROM flights WHERE status = 'scheduled' ORDER BY departure_time ASC"
            );
            return res.json(flights);
        }

        let query = "SELECT * FROM flights WHERE status = 'scheduled'";
        const params = [];

        if (source) {
            query += " AND source LIKE ?";
            params.push(`%${source}%`);
        }
        if (destination) {
            query += " AND destination LIKE ?";
            params.push(`%${destination}%`);
        }
        if (date) {
            query += " AND DATE(departure_time) = ?";
            params.push(date);
        }

        query += " ORDER BY departure_time ASC";
        const flights = await db.query(query, params);
        res.json(flights);
    } catch (error) {
        res.status(500).json({ message: "Error searching flights." });
    }
};

const updateFlight = async (req, res) => {
    try {
        const { price, available_seats } = req.body;
        const { id } = req.params;

        const updates = [];
        const params = [];

        if (price !== undefined) {
            updates.push("price = ?");
            params.push(price);
        }
        if (available_seats !== undefined) {
            updates.push("available_seats = ?");
            params.push(available_seats);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No fields to update." });
        }

        params.push(id);
        await db.run(`UPDATE flights SET ${updates.join(", ")} WHERE flight_id = ?`, params);
        res.json({ message: "Flight updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};

const cancelFlight = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        await db.run("UPDATE flights SET status = 'cancelled', cancellation_message = ? WHERE flight_id = ?", [message, id]);
        await db.run("UPDATE bookings SET status = 'cancelled' WHERE flight_id = ?", [id]);
        res.json({ message: "Flight cancelled. All bookings have been notified." });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};

const deleteFlight = async (req, res) => {
    try {
        await db.run("UPDATE flights SET status = 'deleted' WHERE flight_id = ?", [req.params.id]);
        res.json({ message: "Flight deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};

const getFlightBookings = async (req, res) => {
    try {
        const bookings = await db.query("SELECT * FROM bookings WHERE flight_id = ?", [req.params.id]);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bookings." });
    }
};

module.exports = { addFlight, getAllFlights, getFlightById, searchFlights, updateFlight, cancelFlight, deleteFlight, getFlightBookings };
