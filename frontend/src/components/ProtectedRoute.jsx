import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
import { useSelector } from 'react-redux';

export default function ProtectedRoute() {
  // const { user, token, loading } = useAuth();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="App-header">Loading...</div>;
  }

  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }
  
  // if (user && !user.profile) {
  //   // If logged in but no profile, force setup
  //   return <Navigate to="/profile-setup" replace />;
  // }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (isAuthenticated && !user?.profile) {
    // If logged in but no profile, force setup
    return <Navigate to="/profile-setup" replace />;
  }
  
  // If logged in and has profile, show the requested page
  return <Outlet />;
}