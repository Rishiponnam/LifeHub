import { useState } from 'react';
import apiClient from '../api/apiClient';

export function MealLogger({ selectedDate, onMealLogged }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null); // To hold AI results
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!query) return;
    setIsLoading(true);
    setError('');
    setAnalysis(null);
    try {
      const response = await apiClient.post('/nutrition/nutrition/analyze', { query });
      setAnalysis(response.data);
    } catch (err) {
      setError('Failed to analyze meal.');
    }
    setIsLoading(false);
  };

  const handleLogMeal = async () => {
    if (!analysis) return;
    setIsLoading(true);
    try {
      // The log endpoint expects a list of items
      const logPayload = {
        items_to_log: analysis.items
      };
      
      // Log it for the selected date
      const response = await apiClient.post(
        `/nutrition/meals/log?log_date=${selectedDate}`, 
        logPayload
      );
      
      // Reset the form and notify the parent component
      setQuery('');
      setAnalysis(null);
      onMealLogged(response.data); // Update the summary
      
    } catch (err) {
      setError('Failed to log meal.');
    }
    setIsLoading(false);
  };

  return (
    <div className="meal-logger">
      <h4>Log a Meal</h4>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g., Had paneer with rice and dal"
        rows={3}
        disabled={isLoading}
      />
      <button onClick={handleAnalyze} disabled={isLoading || !query}>
        {isLoading ? 'Analyzing...' : 'Analyze Meal'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {analysis && (
        <div className="analysis-preview">
          <h5>Analysis Results:</h5>
          <p>
            <strong>Total Calories: {analysis.totals.calories.toFixed(0)}</strong>
          </p>
          <ul>
            {analysis.items.map((item, index) => (
              <li key={index}>
                {item.name} ({item.quantity_g}g) - {item.calories.toFixed(0)} kcal
              </li>
            ))}
          </ul>
          <button onClick={handleLogMeal} disabled={isLoading}>
            Confirm & Log Meal
          </button>
        </div>
      )}
      {/* We would also add a "Log Manual Entry" section here,
        which would have fields for name, calories, protein, etc.
        and call the same handleLogMeal function.
      */}
    </div>
  );
}