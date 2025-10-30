import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { DailySummary } from '../components/DailySummary';
import { MealLogger } from '../components/MealLogger';
// import { SavedMealsList } from '../components/SavedMealsList';
import { MyFoodsLogger } from '../components/MyFoodsLogger';
import ErrorBoundary from '../components/ErrorBoundary';

export default function NutritionPage() {
  const [dailyLog, setDailyLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchDailyLog = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/nutrition/meals/by-date?log_date=${date}`);
      setDailyLog(response.data);
    } catch (error) {
      console.error("Error fetching daily log:", error);
      setError("Could not load nutrition data for this date.");
      setDailyLog(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log('Daily Log:', dailyLog);
    fetchDailyLog(selectedDate);
  }, [selectedDate]);

  // This function will be passed to the logger
  // so it can update the parent's state
  const handleMealLogged = (newLogData) => {
    setDailyLog(newLogData);
  };

  // Helper function to render content
  const renderContent = () => {
    if (loading) {
      return <p>Loading nutrition data...</p>;
    }
    
    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>;
    }
    
    if (dailyLog) {
      return (
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <ErrorBoundary>
              <DailySummary log={dailyLog} />
            </ErrorBoundary>
            {/* <SavedMealsList onMealSelected={handleMealLogged} /> */}
          </div>
          <div style={{ flex: 1 }}>
            <MealLogger 
              selectedDate={selectedDate} 
              onMealLogged={handleMealLogged} 
            />
            <hr />
            <MyFoodsLogger
              selectedDate={selectedDate}
              onMealLogged={handleMealLogged}
            />
          </div>
        </div>
      );
    }
    
    // This case should ideally not be hit, but it's a safe fallback
    return <p>No data available.</p>;
  }

  return (
    <ErrorBoundary>
      <div>
        <h2>Nutrition Tracker</h2>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        {renderContent()}
      </div>
    </ErrorBoundary>
  );
}