import { useAuth } from '../contexts/AuthContext';
import NutritionPage from './NUtritionPage'; // Import the new page

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="App-header">
      <h1>Welcome, {user.full_name}!</h1>
      <button onClick={logout}>Logout</button>
      <hr />
      {/* Render the nutrition page directly */}
      <NutritionPage />
    </div>
  );
}