import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useCurrency } from "../context/CurrencyContext";
import { CITIES } from "../data/cities";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
    const { format } = useCurrency();
    const [flights, setFlights] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [cancelRequests, setCancelRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [activeTab, setActiveTab] = useState("flights");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [cancelMessage, setCancelMessage] = useState("");
    const [newFlight, setNewFlight] = useState({
        flight_number: "",
        source: "",
        destination: "",
        departure_time: "",
        arrival_time: "",
        capacity: "",
        price: "",
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "flights") {
                setFlights(await api.getFlights());
            } else if (activeTab === "bookings") {
                setBookings(await api.getAllBookings());
            } else {
                setCancelRequests(await api.getCancelRequests());
            }
        } catch (err) {
            showMessage("error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    };

    const handleAddFlight = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.addFlight(newFlight);
            showMessage("success", "Flight added.");
            setShowAddModal(false);
            setNewFlight({
                flight_number: "",
                source: "",
                destination: "",
                departure_time: "",
                arrival_time: "",
                capacity: "",
                price: "",
            });
            fetchData();
        } catch (err) {
            showMessage("error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelFlight = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.cancelFlight(selectedFlight.flight_id, cancelMessage);
            showMessage("success", "Flight cancelled.");
            setShowCancelModal(false);
            fetchData();
        } catch (err) {
            showMessage("error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFlight = async (flightId) => {
        if (!window.confirm("Delete this flight permanently?")) return;
        setLoading(true);
        try {
            await api.deleteFlight(flightId);
            showMessage("success", "Flight deleted.");
            fetchData();
        } catch (err) {
            showMessage("error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveCancel = async (bookingId) => {
        if (!window.confirm("Approve cancellation?")) return;
        setLoading(true);
        try {
            await api.approveCancel(bookingId);
            showMessage("success", "Approved.");
            fetchData();
        } catch (err) {
            showMessage("error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectCancel = async (bookingId) => {
        if (!window.confirm("Reject cancellation?")) return;
        setLoading(true);
        try {
            await api.rejectCancel(bookingId);
            showMessage("success", "Rejected.");
            fetchData();
        } catch (err) {
            showMessage("error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            confirmed: "badge-success",
            cancelled: "badge-danger",
            cancel_requested: "badge-warning",
            scheduled: "badge-primary",
        };
        return badges[status] || "badge-primary";
    };

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                {message.text && (
                    <div className={`alert alert-${message.type === "error" ? "error" : "success"}`}>
                        {message.text}
                    </div>
                )}

                <div className="page-header">
                    <h1 className="page-title">Admin dashboard</h1>
                    <p className="page-subtitle">Manage flights, bookings, and cancellations</p>
                </div>

                <div className="stats-row">
                    <div className="stat-card">
                        <h3>{flights.length}</h3>
                        <p>Flights</p>
                    </div>
                    <div className="stat-card">
                        <h3>{bookings.length}</h3>
                        <p>Bookings</p>
                    </div>
                    <div className="stat-card">
                        <h3>{cancelRequests.length}</h3>
                        <p>Pending cancellations</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="tab-group">
                            {["flights", "bookings", "cancellations"].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    className={`btn btn-sm ${activeTab === tab ? "btn-primary" : "btn-secondary"}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                        {activeTab === "flights" && (
                            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
                                + Add flight
                            </button>
                        )}
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="loading-spinner"><div className="spinner" /></div>
                        ) : activeTab === "flights" ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Flight</th>
                                            <th>Route</th>
                                            <th>Departure</th>
                                            <th>Price</th>
                                            <th>Seats</th>
                                            <th>Status</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {flights.map((f) => (
                                            <tr key={f.flight_id}>
                                                <td><strong>{f.flight_number}</strong></td>
                                                <td>{f.source} → {f.destination}</td>
                                                <td>{new Date(f.departure_time).toLocaleString()}</td>
                                                <td>{format(f.price)}</td>
                                                <td>{f.available_seats}/{f.capacity}</td>
                                                <td>
                                                    <span className={`badge ${getStatusBadge(f.status)}`}>{f.status}</span>
                                                </td>
                                                <td>
                                                    <div className="actions">
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => {
                                                                setSelectedFlight(f);
                                                                setShowCancelModal(true);
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline btn-sm"
                                                            onClick={() => handleDeleteFlight(f.flight_id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : activeTab === "bookings" ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>User</th>
                                            <th>Flight</th>
                                            <th>Route</th>
                                            <th>Pax</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((b) => (
                                            <tr key={b.booking_id}>
                                                <td>#{b.booking_id}</td>
                                                <td>
                                                    {b.user_name}
                                                    <br />
                                                    <small style={{ color: "var(--muted)" }}>{b.user_email}</small>
                                                </td>
                                                <td>{b.flight_number}</td>
                                                <td>{b.source} → {b.destination}</td>
                                                <td>{b.passengers_count}</td>
                                                <td>{format(b.total_amount)}</td>
                                                <td>
                                                    <span className={`badge ${getStatusBadge(b.status)}`}>{b.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>User</th>
                                            <th>Flight</th>
                                            <th>Reason</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cancelRequests.map((r) => (
                                            <tr key={r.booking_id}>
                                                <td>#{r.booking_id}</td>
                                                <td>{r.user_name}</td>
                                                <td>{r.flight_number}</td>
                                                <td>{r.cancellation_reason || "—"}</td>
                                                <td>
                                                    <div className="actions">
                                                        <button
                                                            type="button"
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleApproveCancel(r.booking_id)}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleRejectCancel(r.booking_id)}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add flight</h3>
                            <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddFlight}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Flight number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newFlight.flight_number}
                                        onChange={(e) => setNewFlight({ ...newFlight, flight_number: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                    <div className="form-group">
                                        <label className="form-label">From</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            list="admin-cities"
                                            value={newFlight.source}
                                            onChange={(e) => setNewFlight({ ...newFlight, source: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">To</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            list="admin-cities"
                                            value={newFlight.destination}
                                            onChange={(e) => setNewFlight({ ...newFlight, destination: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <datalist id="admin-cities">
                                    {CITIES.map((c) => (
                                        <option key={c} value={c} />
                                    ))}
                                </datalist>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                    <div className="form-group">
                                        <label className="form-label">Departure</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            value={newFlight.departure_time}
                                            onChange={(e) => setNewFlight({ ...newFlight, departure_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Arrival</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            value={newFlight.arrival_time}
                                            onChange={(e) => setNewFlight({ ...newFlight, arrival_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                    <div className="form-group">
                                        <label className="form-label">Capacity</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={newFlight.capacity}
                                            onChange={(e) => setNewFlight({ ...newFlight, capacity: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Price (USD base)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-input"
                                            value={newFlight.price}
                                            onChange={(e) => setNewFlight({ ...newFlight, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Close
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? "Adding…" : "Add flight"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCancelModal && selectedFlight && (
                <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Cancel {selectedFlight.flight_number}</h3>
                            <button type="button" className="modal-close" onClick={() => setShowCancelModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCancelFlight}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Message to passengers</label>
                                    <textarea
                                        className="form-input"
                                        rows="3"
                                        value={cancelMessage}
                                        onChange={(e) => setCancelMessage(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                                    Close
                                </button>
                                <button type="submit" className="btn btn-danger" disabled={loading}>
                                    {loading ? "Cancelling…" : "Cancel flight"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
