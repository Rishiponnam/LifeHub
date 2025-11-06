import { Link } from 'react-router-dom';
import './Dashboard.css'; // Reuse the CSS for cards

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

export default function NutritionHubPage() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Nutrition Hub</h1>
        <Link to="/"><button>Back to Dashboard</button></Link>
      </header>
      <div className="services-grid">
        <ServiceCard
          title="AI Meal Logger"
          description="Analyze a full day's meal from a single text description."
          linkTo="/nutrition/ai-logger"
          enabled={true}
        />
        <ServiceCard
          title="Log from 'My Foods'"
          description="Log individual items from your personal food library."
          linkTo="/nutrition/my-foods"
          enabled={true}
        />
        <ServiceCard
          title="Daily Summary"
          description="View, edit, and manage your logged meals by date."
          linkTo="/nutrition/summary"
          enabled={true}
        />
      </div>
    </div>
  );
}