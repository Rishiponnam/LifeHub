import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

// --- THUNKS (Async API calls) ---

export const fetchMasterExercises = createAsyncThunk(
    'workouts/fetchMasterExercises',
    async (_, { rejectWithValue }) => {
        try {
            // Fetch a large limit to get all exercises
            const response = await apiClient.get('/workouts/exercises?limit=1000');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchUserWorkoutPlans = createAsyncThunk(
    'workouts/fetchUserWorkoutPlans',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/workouts/plans');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const createWorkoutPlan = createAsyncThunk(
    'workouts/createWorkoutPlan',
    async (planData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/workouts/plans', planData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteWorkoutPlan = createAsyncThunk(
    'workouts/deleteWorkoutPlan',
    async (planId, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/workouts/plans/${planId}`);
            return planId; // Return the ID for filtering
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// --- SLICE ---

const initialState = {
    masterExerciseList: [],
    userWorkoutPlans: [],
    loading: false,
    error: null,
};

const workoutSlice = createSlice({
    name: 'workouts',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Exercises
            .addCase(fetchMasterExercises.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMasterExercises.fulfilled, (state, action) => {
                state.loading = false;
                state.masterExerciseList = action.payload;
            })
            .addCase(fetchMasterExercises.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.detail || 'Failed to fetch exercises';
            })
            // Fetch Plans
            .addCase(fetchUserWorkoutPlans.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserWorkoutPlans.fulfilled, (state, action) => {
                state.loading = false;
                state.userWorkoutPlans = action.payload;
            })
            .addCase(fetchUserWorkoutPlans.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.detail || 'Failed to fetch plans';
            })
            // Create Plan
            .addCase(createWorkoutPlan.fulfilled, (state, action) => {
                state.userWorkoutPlans.push(action.payload);
            })
            // Delete Plan
            .addCase(deleteWorkoutPlan.fulfilled, (state, action) => {
                state.userWorkoutPlans = state.userWorkoutPlans.filter(
                    (plan) => plan.id !== action.payload
                );
            });
    },
});

export default workoutSlice.reducer;