import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

// A reusable component for our service cards
const ServiceCard = ({ title, description, linkTo, enabled = false }) => {
  return (
    <div className={`service-card ${enabled ? 'enabled' : 'disabled'}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link to={enabled ? linkTo : '#'}>
        <button disabled={!enabled}>
          {enabled ? 'Open' : 'Coming Soon'}
        </button>
      </Link>
    </div>
  );
};

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome!</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>
      
      <div className="services-grid">
        <ServiceCard
          title="Nutrition"
          description="Log meals, track macros, and get AI-powered insights."
          linkTo="/nutrition"
          enabled={true}
        />
        <ServiceCard
          title="Workouts"
          description="Build workout plans, log your sessions, and track progress."
          linkTo="/workouts"
          enabled={true}
        />
        <ServiceCard
          title="AI Guidance"
          description="Get personalized bulk, cut, or recomp plans."
          linkTo="/guidance"
          enabled={false}
        />
        <ServiceCard
          title="Analytics"
          description="View trends for calorie intake, workout frequency, and more."
          linkTo="/analytics"
          enabled={false}
        />
        <ServiceCard
          title="Progress"
          description="Track your weight, upload progress photos, and see your journey."
          linkTo="/progress"
          enabled={false}
        />
      </div>
    </div>
  );
}