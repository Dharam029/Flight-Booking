import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        try {
            await api.register(formData);
            navigate("/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-panel auth-panel-brand">
                <h1>Join SkyBook</h1>
                <p>Create an account to search and book flights throughout Asia.</p>
                <div className="auth-features">
                    <div className="auth-feature"><span className="auth-feature-dot" /> Mumbai, Delhi, Beijing & more</div>
                    <div className="auth-feature"><span className="auth-feature-dot" /> Kuala Lumpur, Penang, Langkawi</div>
                    <div className="auth-feature"><span className="auth-feature-dot" /> Free to register</div>
                </div>
            </div>
            <div className="auth-panel">
                <div className="auth-card">
                    <h1 className="auth-title">Create account</h1>
                    <p className="auth-subtitle">Fill in your details to get started.</p>
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone (optional)</label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="+91 …"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Min. 6 characters"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? "Creating…" : "Create account"}
                        </button>
                    </form>
                    <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--muted)" }}>
                        Already registered? <Link to="/login" className="text-link">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
