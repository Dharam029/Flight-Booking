import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useCurrency } from "../context/CurrencyContext";
import { CITIES, getRegion } from "../data/cities";
import Navbar from "../components/Navbar";

const QUICK_ROUTES = [
    { source: "Mumbai", destination: "Delhi" },
    { source: "Bangalore", destination: "Goa" },
    { source: "Beijing", destination: "Shanghai" },
    { source: "Kuala Lumpur", destination: "Penang" },
    { source: "Mumbai", destination: "Kuala Lumpur" },
    { source: "Shanghai", destination: "Kuala Lumpur" },
];

const regionClass = (region) => {
    if (region === "India") return "region-india";
    if (region === "China") return "region-china";
    if (region === "Malaysia") return "region-malaysia";
    return "";
};

export default function UserDashboard() {
    const { format, currency } = useCurrency();
    const [searchParams, setSearchParams] = useState({ source: "", destination: "" });
    const [flights, setFlights] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [passengers, setPassengers] = useState([{ name: "", age: "", gender: "" }]);
    const [travelClass, setTravelClass] = useState("economy");
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchFlights();
        fetchBookings();
    }, []);

    const fetchFlights = async () => {
        try {
            const data = await api.getFlights();
            setFlights(data);
        } catch (err) {
            showMessage("error", err.message);
        }
    };

    const fetchBookings = async () => {
        try {
            const data = await api.getMyBookings();
            setMyBookings(data);
        } catch (err) {
            showMessage("error", err.message);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const source = searchParams.source.trim();
            const destination = searchParams.destination.trim();
            if (source || destination) {
                const data = await api.searchFlights({ source, destination });
                setFlights(data);
            } else {
                await fetchFlights();
            }
        } catch (err) {
            showMessage("error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const filterByCity = async (city) => {
        setSearchParams({ source: city, destination: "" });
        setLoading(true);
        try {
            const data = await api.searchFlights({ source: city, destination: "" });
            setFlights(data);
        } catch (err) {
            showMessage("error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const applyQuickRoute = (route) => {
        setSearchParams(route);
    };

    const handleBook = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.bookFlight({
                flight_id: selectedFlight.flight_id,
                passengers,
                travel_class: travelClass,
                total_amount: selectedFlight.price * passengers.length,
            });
            showMessage("success", "Booking confirmed!");
            setShowBookModal(false);
            setPassengers([{ name: "", age: "", gender: "" }]);
            fetchFlights();
            fetchBookings();
        } catch (err) {
            showMessage("error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (bookingId) => {
        const reason = window.prompt("Reason for cancellation:");
        if (!reason?.trim()) {
            showMessage("error", "Please provide a reason for cancellation");
            return;
        }
        setLoading(true);
        try {
            await api.requestCancel(bookingId, reason);
            showMessage("success", "Cancellation requested.");
            fetchBookings();
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
        };
        return badges[status] || "badge-primary";
    };

    const totalUsd = selectedFlight ? selectedFlight.price * passengers.length : 0;

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
                    <h1 className="page-title">Find a flight</h1>
                    <p className="page-subtitle">
                        Search routes across India, China & Malaysia · Prices shown in {currency}
                    </p>
                </div>

                <div className="search-card">
                    <form className="search-form" onSubmit={handleSearch}>
                        <div>
                            <label className="form-label">From</label>
                            <input
                                type="text"
                                className="form-input"
                                list="cities-from"
                                placeholder="Departure city"
                                value={searchParams.source}
                                onChange={(e) => setSearchParams({ ...searchParams, source: e.target.value })}
                            />
                            <datalist id="cities-from">
                                {CITIES.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="form-label">To</label>
                            <input
                                type="text"
                                className="form-input"
                                list="cities-to"
                                placeholder="Destination city"
                                value={searchParams.destination}
                                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
                            />
                            <datalist id="cities-to">
                                {CITIES.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Searching…" : "Search"}
                        </button>
                    </form>
                    <div className="quick-routes">
                        <span className="quick-route-label">Popular routes</span>
                        {QUICK_ROUTES.map((r) => (
                            <button
                                key={`${r.source}-${r.destination}`}
                                type="button"
                                className="chip"
                                onClick={() => applyQuickRoute(r)}
                            >
                                {r.source} → {r.destination}
                            </button>
                        ))}
                    </div>
                    <div className="quick-routes" style={{ borderTop: "none", paddingTop: 0 }}>
                        <span className="quick-route-label">Browse by city (all flights from)</span>
                        {["Mumbai", "Delhi", "Bangalore", "Beijing", "Shanghai", "Kuala Lumpur", "Singapore", "Bangkok"].map((city) => (
                            <button key={city} type="button" className="chip" onClick={() => filterByCity(city)}>
                                {city}
                            </button>
                        ))}
                        <button type="button" className="chip" onClick={() => { setSearchParams({ source: "", destination: "" }); fetchFlights(); }}>
                            Show all
                        </button>
                    </div>
                </div>

                <h2 className="section-title">
                    {flights.length} flight{flights.length !== 1 ? "s" : ""} available
                </h2>

                {flights.length === 0 ? (
                    <div className="empty-state">
                        <h3>No flights found</h3>
                        <p>Try a popular route above or search different cities</p>
                    </div>
                ) : (
                    <div className="flights-grid">
                        {flights.map((flight) => {
                            const region = getRegion(flight.source) || getRegion(flight.destination);
                            return (
                                <article key={flight.flight_id} className="flight-card">
                                    <div className="flight-card-top">
                                        <div>
                                            <div className="flight-number">{flight.flight_number}</div>
                                            {region && (
                                                <span className={`region-badge ${regionClass(region)}`}>
                                                    {region}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flight-price">{format(flight.price)}</div>
                                            <div className="flight-price-note">per person · {currency}</div>
                                        </div>
                                    </div>
                                    <div className="flight-route">
                                        <div>
                                            <div className="route-city">{flight.source}</div>
                                            <div className="route-meta">Departure</div>
                                        </div>
                                        <span className="route-arrow">→</span>
                                        <div style={{ textAlign: "right" }}>
                                            <div className="route-city">{flight.destination}</div>
                                            <div className="route-meta">Arrival</div>
                                        </div>
                                    </div>
                                    <div className="flight-meta">
                                        <span>
                                            {new Date(flight.departure_time).toLocaleString(undefined, {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </span>
                                        <span>{flight.available_seats} seats left</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-block"
                                        style={{ marginTop: "1rem" }}
                                        onClick={() => {
                                            setSelectedFlight(flight);
                                            setShowBookModal(true);
                                        }}
                                    >
                                        Book — {format(flight.price)}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}

                <div style={{ marginTop: "2.5rem" }}>
                    <h2 className="section-title">My bookings</h2>
                    {myBookings.length === 0 ? (
                        <div className="empty-state">
                            <h3>No bookings yet</h3>
                            <p>Your confirmed trips will appear here</p>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Flight</th>
                                            <th>Route</th>
                                            <th>Date</th>
                                            <th>Pax</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myBookings.map((booking) => (
                                            <tr key={booking.booking_id}>
                                                <td><strong>{booking.flight_number}</strong></td>
                                                <td>{booking.source} → {booking.destination}</td>
                                                <td>{new Date(booking.departure_time).toLocaleDateString()}</td>
                                                <td>{booking.passengers_count}</td>
                                                <td>{format(booking.total_amount)}</td>
                                                <td>
                                                    <span className={`badge ${getStatusBadge(booking.status)}`}>
                                                        {booking.status.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td>
                                                    {booking.status === "confirmed" && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleCancelRequest(booking.booking_id)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {showBookModal && selectedFlight && (
                <div className="modal-overlay" onClick={() => setShowBookModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Book {selectedFlight.flight_number}</h3>
                            <button type="button" className="modal-close" onClick={() => setShowBookModal(false)} aria-label="Close">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleBook}>
                            <div className="modal-body">
                                <p style={{ marginBottom: "1rem", color: "var(--muted)", fontSize: "0.875rem" }}>
                                    {selectedFlight.source} → {selectedFlight.destination} · {format(selectedFlight.price)} per person
                                </p>
                                <div className="form-group">
                                    <label className="form-label">Class</label>
                                    <select
                                        className="form-input"
                                        value={travelClass}
                                        onChange={(e) => setTravelClass(e.target.value)}
                                    >
                                        <option value="economy">Economy</option>
                                        <option value="business">Business</option>
                                        <option value="first">First</option>
                                    </select>
                                </div>
                                <p className="form-label" style={{ marginBottom: "0.75rem" }}>Passengers</p>
                                {passengers.map((p, i) => (
                                    <div key={i} className="passenger-block">
                                        <div className="form-group">
                                            <label className="form-label">Name</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={p.name}
                                                onChange={(e) => {
                                                    const np = [...passengers];
                                                    np[i].name = e.target.value;
                                                    setPassengers(np);
                                                }}
                                                required
                                            />
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">Age</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    value={p.age}
                                                    onChange={(e) => {
                                                        const np = [...passengers];
                                                        np[i].age = e.target.value;
                                                        setPassengers(np);
                                                    }}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">Gender</label>
                                                <select
                                                    className="form-input"
                                                    value={p.gender}
                                                    onChange={(e) => {
                                                        const np = [...passengers];
                                                        np[i].gender = e.target.value;
                                                        setPassengers(np);
                                                    }}
                                                    required
                                                >
                                                    <option value="">Select</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setPassengers([...passengers, { name: "", age: "", gender: "" }])}
                                >
                                    + Add passenger
                                </button>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowBookModal(false)}>
                                    Close
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? "Booking…" : `Pay ${format(totalUsd)}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
