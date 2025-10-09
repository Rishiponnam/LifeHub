import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // useEffect hook runs after the component mounts
  useEffect(() => {
    // We use a relative URL here. The /api path will be proxied
    // by NGINX in production or the Vite dev server during development.
    fetch('/api/v1/hello')
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setMessage("Failed to connect to the backend.");
        setLoading(false);
      });
  }, []); // The empty array [] means this effect runs only once

  return (
    <div className="App">
      <header className="App-header">
        <h1>LifeHub</h1>
        <p>
          {loading ? "Loading..." : message}
        </p>
      </header>
    </div>
  );
}

export default App;