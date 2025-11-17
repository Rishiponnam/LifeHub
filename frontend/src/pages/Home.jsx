import { Link } from 'react-router-dom';
import { services } from '../utils/siteContent';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      {/* Welcome Hero */}
      <section className="hero-section">
        <h1>Your Smart Daily Optimizer</h1>
        <p>One platform to manage your nutrition, habits, focus, health, and goals.</p>
      </section>

      {/* Service Sections */}
      {services.map((service, index) => (
        <section key={service.id} className={`service-section ${index % 2 === 0 ? 'dark' : 'light'}`}>
          <div className="content-wrapper">
            <div className="text-content">
              <h2>{service.title}</h2>
              <p>{service.description}</p>
              <Link to={service.path}>
                <button className="cta-button">Go to {service.title}</button>
              </Link>
            </div>
            {/* Placeholder for where an image would go */}
            <div className="visual-content">
               <div className={`placeholder-img type-${service.id}`}>
                  {service.title.charAt(0)}
               </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}