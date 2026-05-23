import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CurrencySelector from "./CurrencySelector";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <Link to={user?.role === "admin" ? "/admin" : "/dashboard"} className="navbar-brand">
                <span className="navbar-brand-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                    </svg>
                </span>
                SkyBook
            </Link>
            <div className="navbar-links">
                {user && <CurrencySelector />}
                {user ? (
                    <>
                        {user.role === "admin" ? (
                            <Link to="/admin" className="nav-link">Admin</Link>
                        ) : (
                            <Link to="/dashboard" className="nav-link">Flights</Link>
                        )}
                        <span className="nav-user">{user.name}</span>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
