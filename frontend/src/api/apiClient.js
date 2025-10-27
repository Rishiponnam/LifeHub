import axios from 'axios';

const baseURL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL,
});

// We'll set the token in AuthContext, but let's export the login function
apiClient.login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await apiClient.post('/login/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data; // Returns { access_token, token_type }
};

export default apiClient;