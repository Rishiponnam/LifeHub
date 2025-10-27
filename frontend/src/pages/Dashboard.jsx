import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="App-header">
      <h1>Welcome to your Dashboard, {user.full_name}!</h1>
      <p>Your goal is to: {user.profile.goal.replace('_', ' ')}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}