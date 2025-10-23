import axios from 'axios';

// The base URL for our FastAPI backend
const baseURL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to handle user login
export const loginUser = async (email, password) => {
  // FastAPI's OAuth2 expects form data, not JSON
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await apiClient.post('/login/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  // Store the token and return the data
  if (response.data.access_token) {
    localStorage.setItem('userToken', response.data.access_token);
  }
  return response.data;
};

// Function to handle user registration
export const registerUser = async (fullName, email, password) => {
    const userData = {
        full_name: fullName,
        email: email,
        password: password
    };
    const response = await apiClient.post('/users/', userData);
    return response.data;
}

export default apiClient;