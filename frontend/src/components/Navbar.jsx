import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { services } from '../utils/siteContent';
import './Navbar.css';

export default function Navbar({ onToggleSidebar }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* 1. Left: Options (Sidebar Toggle) */}
      <div className="nav-left">
        <button className="options-btn" onClick={onToggleSidebar}>
          ☰ Options
        </button>
      </div>

      {/* 2. Center: Logo & Services */}
      <div className="nav-center">
        <Link to="/" className="nav-brand">LifeHub</Link>
        
        <div className="nav-services">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="nav-item"
              onMouseEnter={() => setActiveDropdown(service.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link to={service.path} className="nav-link">
                {service.title} {service.subOptions.length > 0 && '▾'}
              </Link>
              
              {/* Dropdown */}
              {service.subOptions.length > 0 && activeDropdown === service.id && (
                <div className="dropdown-menu">
                  {service.subOptions.map((sub) => (
                    <Link key={sub.path} to={sub.path} className="dropdown-item">
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Right: User & Profile */}
      <div className="nav-right">
        <span className="nav-username">Hi, {user?.full_name.split(' ')[0]}</span>
        
        <div className="profile-container">
          <div 
            className="profile-icon" 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            {user?.full_name.charAt(0).toUpperCase()}
          </div>
          
          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="profile-header">Signed in as <strong>{user?.email}</strong></div>
              <hr />
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}