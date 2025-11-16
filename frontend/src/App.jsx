import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserData } from './store/authSlice';
import './App.css';

// Page Components
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import Dashboard from './pages/Dashboard';
import NutritionHubPage from './pages/NutritionHubPage';
import AILoggerPage from './pages/AILoggerPage';
import MyFoodsPage from './pages/MyFoodsPage';
import MealSummaryPage from './pages/MealSummaryPage';
import ProtectedRoute from './components/ProtectedRoute';
import WorkoutHubPage from './pages/WorkoutHubPage';
import WorkoutPlansPage from './pages/WorkoutPlansPage';
import WorkoutLogPage from './pages/WorkoutLogPage';
import WorkoutCalendarPage from './pages/WorkoutCalendarPage';
import Navbar from './components/Navbar';

// Placeholder for coming soon pages
const ComingSoon = () => <div className="App-header"><h1>Coming Soon!</h1></div>;

function App() {
  const { token, loading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUserData());
    }
  }, [dispatch, token, user]); // Run only when token or dispatch changes

  // Show a global loading screen while checking token
  if (loading && !token) { 
    // This is the brief "logging in..." state
    return <div className="App-header">Loading...</div>;
  }

  if (loading) {
    return <div className="App-header">Loading app...</div>;
  }

  return (
      <div className="app-container">
          <Navbar /> {/* Navbar here */}
          <main className="main-content"> {/* Wrap routes in a 'main' tag */}
              <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/" />} />
                  <Route path="/profile-setup" element={token && !user?.profile ? <ProfileSetupPage /> : <Navigate to="/" />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/nutrition" element={<NutritionHubPage />} />
                      <Route path="/nutrition/ai-logger" element={<AILoggerPage />} />
                      <Route path="/nutrition/my-foods" element={<MyFoodsPage />} />
                      <Route path="/nutrition/summary" element={<MealSummaryPage />} />

                      {/* --- WORKOUT ROUTES --- */}
                      <Route path="/workouts" element={<WorkoutHubPage />} />
                      <Route path="/workouts/plans" element={<WorkoutPlansPage />} />
                      <Route path="/workouts/log" element={<WorkoutLogPage />} />
                      <Route path="/workouts/log/:planId" element={<WorkoutLogPage />} /> {/* For logging from a plan */}
                      <Route path="/workouts/calendar" element={<WorkoutCalendarPage />} />

                      {/* Placeholder Routes */}
                      {/* <Route path="/workouts" element={<ComingSoon />} /> */}
                      <Route path="/guidance" element={<ComingSoon />} />
                      <Route path="/analytics" element={<ComingSoon />} />
                      <Route path="/progress" element={<ComingSoon />} />
                  </Route>

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" />} />
              </Routes>
          </main>
      </div>
  );
}

export default App;