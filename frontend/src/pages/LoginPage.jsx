import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';
import apiClient from '../api/apiClient'; // For registration

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [error, setError] = useState('');

  //Redux state
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [registerError, setRegisterError] = useState(null);
  
  // const { login } = useAuth(); // Get login function from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError(null);
    
    if (isLogin) {
      // --- DISPATCH LOGIN THUNK ---
      // .unwrap() allows us to use try/catch with thunks
      try {
        await dispatch(loginUser({ email, password })).unwrap();
        // No navigation needed, App.jsx will see the state change
      } catch (err) {
        // Error is already in Redux state, but we can log it
        console.error('Login failed:', err);
      }

    } else {
      // --- Register Logic (still uses apiClient directly) ---
      try {
        await apiClient.post('/users/', { full_name: fullName, email, password });
        // After register, log them in
        await dispatch(loginUser({ email, password })).unwrap();
      } catch (err) {
        setRegisterError(err.response?.data?.detail || 'Registration failed.');
      }
    }
  };

  return (
    <div className="App App-header">
      <h1>{isLogin ? 'Login' : 'Register'}</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      
      {error && <p className="message">{error}</p>}
      {registerError && <p className="message">{registerError}</p>}
      
      <button onClick={() => setIsLogin(!isLogin)} className="toggle-button">
        {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
      </button>
    </div>
  );
}