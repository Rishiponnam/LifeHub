import { Link } from 'react-router-dom';
import '../pages/Dashboard.css'; // Reuse the CSS for cards

// Re-using this component from Dashboard.jsx. 
// You could move ServiceCard to its own file.
const ServiceCard = ({ title, description, linkTo, enabled = false }) => (
  <div className={`service-card ${enabled ? 'enabled' : 'disabled'}`}>
    <h3>{title}</h3>
    <p>{description}</p>
    <Link to={enabled ? linkTo : '#'}><button disabled={!enabled}>{enabled ? 'Open' : 'Coming Soon'}</button></Link>
  </div>
);

export default function WorkoutHubPage() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Workout Hub</h1>
        <Link to="/"><button>Back to Dashboard</button></Link>
      </header>
      <div className="services-grid">
        <ServiceCard
          title="My Workout Plans"
          description="Create, view, and edit your reusable workout templates."
          linkTo="/workouts/plans"
          enabled={true}
        />
        <ServiceCard
          title="Log a Workout"
          description="Log a new workout for today, either from a plan or ad-hoc."
          linkTo="/workouts/log"
          enabled={true}
        />
        <ServiceCard
          title="Workout Calendar"
          description="View your completed workouts and track your consistency."
          linkTo="/workouts/calendar"
          enabled={true}
        />
      </div>
    </div>
  );
}