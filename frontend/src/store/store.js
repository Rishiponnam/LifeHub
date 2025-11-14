import { configureStore } from '@reduxjs/toolkit';
// We will create these slice files next
import authReducer from './authSlice';
import nutritionReducer from './nutritionSlice';
import workoutReducer from './workoutSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    nutrition: nutritionReducer,
    workouts: workoutReducer,
  },
});