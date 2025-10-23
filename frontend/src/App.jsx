import { useState } from 'react';
import { loginUser, registerUser } from './api/apiClient';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(localStorage.getItem('userToken'));
  const MAX_PASSWORD_LENGTH = 72;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
  
    try {
      let password = e.target.password.value;

      // Check password length
      if (password.length > MAX_PASSWORD_LENGTH) {
        throw new Error(`Password cannot exceed ${MAX_PASSWORD_LENGTH} characters.`);
      }

      console.log("Attempting to submit:", { email, password, isLogin });

      if (isLogin) {
        const data = await loginUser(email, password);
        setToken(data.access_token);
        setMessage('Login successful!');
      } else {
        console.log("Attempting to register:", { fullName, email, password });
        await registerUser(fullName, email, password);
        setMessage('Registration successful! Please log in.');
        setIsLogin(true); // Switch to login form
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setMessage(error.response?.data?.detail || 'An error occurred.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setToken(null);
    setMessage('Logged out.');
  }

  if (token) {
    return (
      <div className="App App-header">
        <h1>Welcome to LifeHub!</h1>
        <p>You are logged in.</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="App App-header">
      <h1>{isLogin ? 'Login' : 'Register'}</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <p className="message">{message}</p>
      <button onClick={() => setIsLogin(!isLogin)} className="toggle-button">
        {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
      </button>
    </div>
  );
}

export default App;