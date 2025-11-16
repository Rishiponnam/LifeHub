import { configureStore } from '@reduxjs/toolkit';
// We will create these slice files next
import authslice from './authSlice';
import nutritionSlice from './nutritionSlice';
import workoutSlice from './workoutSlice';

const store = configureStore({
  reducer: {
    auth: authslice,
    nutrition: nutritionSlice,
    workout: workoutSlice,
  },
});
export { store };