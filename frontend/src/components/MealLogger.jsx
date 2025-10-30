import { useState } from 'react';
import apiClient from '../api/apiClient';

export function MealLogger({ selectedDate, onMealLogged }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null); // To hold AI results
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSavePlan = async () => {
    if (!analysis || !analysis.items.length) return;
    
    const planName = prompt("Enter a name for this meal plan:", "My Breakfast");
    if (!planName) return; // User cancelled
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const planPayload = {
        name: planName,
        items: analysis.items
      };
      await apiClient.post('/nutrition/meal-plans', planPayload);
      setSuccess(`Meal plan "${planName}" saved!`);
      // We might want to trigger a refresh of the saved meals list here
      // (This is a more advanced step for later)
      
    } catch (err) {
      setError('Failed to save meal plan.');
    }
    setIsLoading(false);
  };

  return (
    <div className="meal-logger">
      <h4>Log a Meal via AI</h4>
      <textarea
        value={query}
        onChange={(e) => {
            setQuery(e.target.value);
            setAnalysis(null); // Clear analysis on new text
            setError('');
            setSuccess('');
        }}
        placeholder="e.g., Had paneer with rice and dal"
        rows={3}
        disabled={isLoading}
      />
      <button onClick={handleAnalyze} disabled={isLoading || !query}>
        {isLoading ? 'Analyzing...' : 'Analyze Meal'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {analysis && (
        <div className="analysis-preview">
          <h5>Analysis Results:</h5>
          
          {/* --- UPDATED TOTALS DISPLAY --- */}
          <div className="totals-summary">
            <p><strong>Calories: {analysis.totals.calories.toFixed(0)}</strong></p>
            <p>Protein: {analysis.totals.protein.toFixed(1)}g</p>
            <p>Carbs: {analysis.totals.carbs.toFixed(1)}g</p>
            <p>Fat: {analysis.totals.fat.toFixed(1)}g</p>
          </div>

          <ul>
            {analysis.items.map((item, index) => (
              <li key={index}>
                {item.name} ({item.quantity_g}g) - {item.calories.toFixed(0)} kcal
                (P:{item.protein.toFixed(1)}g, C:{item.carbs.toFixed(1)}g, F:{item.fat.toFixed(1)}g)
              </li>
            ))}
          </ul>
          
          {/* --- UPDATED BUTTONS --- */}
          <div className="button-group">
            <button onClick={handleLogMeal} disabled={isLoading}>
              Confirm & Log Meal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}