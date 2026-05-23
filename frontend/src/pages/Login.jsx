import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const AuthBrand = () => (
    <div className="auth-panel auth-panel-brand">
        <h1>SkyBook</h1>
        <p>Book flights across India, China, and Malaysia with prices in your preferred currency.</p>
        <div className="auth-features">
            <div className="auth-feature"><span className="auth-feature-dot" /> 24+ regional routes</div>
            <div className="auth-feature"><span className="auth-feature-dot" /> USD, INR & CNY display</div>
            <div className="auth-feature"><span className="auth-feature-dot" /> Simple, secure booking</div>
        </div>
    </div>
);

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await api.login(formData);
            login(data.token, data.user);
            navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <AuthBrand />
            <div className="auth-panel">
                <div className="auth-card">
                    <h1 className="auth-title">Sign in</h1>
                    <p className="auth-subtitle">Welcome back. Enter your credentials to continue.</p>
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={handleSubmit}>
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
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Your password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                    </form>
                    <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--muted)" }}>
                        No account? <Link to="/register" className="text-link">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
