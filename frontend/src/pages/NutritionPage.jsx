import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { DailySummary } from '../components/DailySummary';
import { MealLogger } from '../components/MealLogger';

export default function NutritionPage() {
  const [dailyLog, setDailyLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchDailyLog = async (date) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/nutrition/meals/by-date?log_date=${date}`);
      setDailyLog(response.data);
    } catch (error) {
      console.error("Error fetching daily log:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDailyLog(selectedDate);
  }, [selectedDate]);

  // This function will be passed to the logger
  // so it can update the parent's state
  const handleMealLogged = (newLogData) => {
    setDailyLog(newLogData);
  };
  
  return (
    <div>
      <h2>Nutrition Tracker</h2>
      <input 
        type="date" 
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      {loading ? (
        <p>Loading nutrition data...</p>
      ) : dailyLog && (
        <>
          <DailySummary log={dailyLog} />
          <MealLogger 
            selectedDate={selectedDate} 
            onMealLogged={handleMealLogged} 
          />
        </>
      )}
    </div>
  );
}