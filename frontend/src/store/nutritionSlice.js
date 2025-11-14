import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

// --- THUNKS (Async API calls) ---

export const fetchDailyLog = createAsyncThunk(
    'nutrition/fetchDailyLog',
    async (date, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/nutrition/meals/by-date?log_date=${date}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const logMealItems = createAsyncThunk(
    'nutrition/logMealItems',
    async ({ date, items_to_log }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(
                `/nutrition/meals/log?log_date=${date}`,
                { items_to_log }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateLoggedItem = createAsyncThunk(
    'nutrition/updateLoggedItem',
    async ({ date, log_item_id, itemData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(
                `/nutrition/meals/log-item/${log_item_id}?log_date=${date}`,
                itemData
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteLoggedItem = createAsyncThunk(
    'nutrition/deleteLoggedItem',
    async ({ date, log_item_id }, { rejectWithValue }) => {
        try {
            const response = await apiClient.delete('/nutrition/meals/log-item', {
                data: { date, log_item_id },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// --- SLICE ---

const initialState = {
    selectedDate: new Date().toISOString().split('T')[0],
    dailyLog: null,
    loading: false,
    error: null,
};

const nutritionSlice = createSlice({
    name: 'nutrition',
    initialState,
    reducers: {
        // Standard reducer to change the selected date
        setSelectedDate: (state, action) => {
            state.selectedDate = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Handle all thunks
        builder
            // Shared "pending" state
            .addMatcher(
                (action) => action.type.startsWith('nutrition/') && action.type.endsWith('/pending'),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            // Shared "rejected" state
            .addMatcher(
                (action) => action.type.startsWith('nutrition/') && action.type.endsWith('/rejected'),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload.detail || 'An error occurred';
                }
            )
            // Shared "fulfilled" state (all our thunks return the updated log)
            .addMatcher(
                (action) => action.type.startsWith('nutrition/') && action.type.endsWith('/fulfilled'),
                (state, action) => {
                    state.loading = false;
                    state.dailyLog = action.payload;
                }
            );
    },
});

export const { setSelectedDate } = nutritionSlice.actions;
export default nutritionSlice.reducer;