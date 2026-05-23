const { register, login, getProfile } = require("../controllers/authController");
const { addFlight, getAllFlights, getFlightById, searchFlights, updateFlight, cancelFlight, deleteFlight, getFlightBookings } = require("../controllers/flightController");
const { bookFlight, getMyBookings, requestCancellation, getAllBookings, getCancelRequests, approveCancellation, rejectCancellation } = require("../controllers/bookingController");
const { verifyToken, adminOnly } = require("../middleware/auth");

module.exports = (app) => {
    app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

    app.post("/api/auth/register", register);
    app.post("/api/auth/login", login);
    app.get("/api/auth/profile", verifyToken, getProfile);

    app.get("/api/flights", getAllFlights);
    app.get("/api/flights/search", searchFlights);
    app.get("/api/flights/:id", getFlightById);
    app.post("/api/flights", verifyToken, adminOnly, addFlight);
    app.put("/api/flights/:id", verifyToken, adminOnly, updateFlight);
    app.post("/api/flights/:id/cancel", verifyToken, adminOnly, cancelFlight);
    app.delete("/api/flights/:id", verifyToken, adminOnly, deleteFlight);
    app.get("/api/flights/:id/bookings", verifyToken, adminOnly, getFlightBookings);

    app.post("/api/bookings", verifyToken, bookFlight);
    app.get("/api/bookings/my", verifyToken, getMyBookings);
    app.post("/api/bookings/:id/cancel", verifyToken, requestCancellation);
    app.get("/api/admin/bookings", verifyToken, adminOnly, getAllBookings);
    app.get("/api/admin/cancellations", verifyToken, adminOnly, getCancelRequests);
    app.post("/api/admin/cancellations/:bookingId/approve", verifyToken, adminOnly, approveCancellation);
    app.post("/api/admin/cancellations/:bookingId/reject", verifyToken, adminOnly, rejectCancellation);
};
