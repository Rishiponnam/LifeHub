import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import './Navbar.css';

export default function Navbar() {
    // Use useSelector to "subscribe" to the auth state
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                🏋️ Smart Gym Companion
            </Link>
            <div className="nav-menu">
                {isAuthenticated && user ? (
                    <>
                        <span className="nav-user">Welcome, {user.full_name}!</span>
                        <button onClick={handleLogout} className="nav-logout-btn">
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </div>
        </nav>
    );
}