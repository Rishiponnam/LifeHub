import { useAuth } from './contexts/AuthContext';
import './App.css';

// You would put these in separate files in a /pages/ directory
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProfileSetupPage from './pages/ProfileSetupPage';

function App() {
  const { user, token } = useAuth();

  if (!token) {
    // No token, show the login/register page
    // We can make LoginPage handle both
    return <LoginPage />;
  }

  if (user && !user.profile) {
    // Logged in, but no profile.
    // Force them to the profile setup wizard.
    return <ProfileSetupPage />;
  }
  
  if (user && user.profile) {
    // Logged in AND has a profile. Show the main app.
    return <Dashboard />;
  }

  // Fallback for loading state, etc.
  return <div className="App-header">Loading...</div>;
}

export default App;