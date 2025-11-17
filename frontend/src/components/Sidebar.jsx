import { Link } from 'react-router-dom';
import { services } from '../utils/siteContent';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      
      {/* Drawer */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Dashboard Options</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="sidebar-content">
          {services.map(service => (
            <div key={service.id} className="sidebar-section">
              <Link to={service.path} className="sidebar-title" onClick={onClose}>
                {service.title}
              </Link>
              <div className="sidebar-links">
                {service.subOptions.map(sub => (
                  <Link key={sub.path} to={sub.path} className="sidebar-link" onClick={onClose}>
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}