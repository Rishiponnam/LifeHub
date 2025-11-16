import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

// 1. LOGIN THUNK (You have this, but for completeness)
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiClient.post('/login/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      
      const { access_token } = response.data;
      localStorage.setItem('userToken', access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // After login, fetch the user's data
      const userResponse = await apiClient.get('/users/me');
      return { token: access_token, user: userResponse.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

// 2. --- NEW THUNK ---
//    (To fetch user data if a token exists on page load)
export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    if (token) {
      try {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const userResponse = await apiClient.get('/users/me');
        return userResponse.data;
      } catch (error) {
        return rejectWithValue('Invalid token');
      }
    }
    return rejectWithValue('No token found');
  }
);

// 3. --- NEW THUNK ---
//    (To create the user profile and update the user state)
export const createProfile = createAsyncThunk(
  'auth/createProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      // POST the new profile data
      await apiClient.post('/profile/', profileData);
      
      // GET the full, updated user object (which now includes the profile)
      const userResponse = await apiClient.get('/users/me');
      return userResponse.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Profile creation failed');
    }
  }
);

const initialState = {
  token: localStorage.getItem('userToken') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('userToken'),
  loading: false, // We'll use this to show loading spinners
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userToken');
      delete apiClient.defaults.headers.common['Authorization'];
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Fetch User Data (on app load)
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchUserData.rejected, (state) => {
        // If token is invalid, log them out
        localStorage.removeItem('userToken');
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      // Create Profile
      .addCase(createProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // Update the user with the new profile data
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;