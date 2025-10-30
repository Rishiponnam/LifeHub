import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export function SavedMealsList({ selectedDate, onMealLogged }) {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/nutrition/meal-plans');
      setPlans(response.data);
    } catch (err) {
      setError('Could not load saved meals.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []); // Fetch plans on component mount

  const handleLogPlan = async (planId) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(
        `/nutrition/meal-plans/${planId}/log?log_date=${selectedDate}`
      );
      // Notify the parent page to update the summary
      onMealLogged(response.data); 
    } catch (err) {
      setError('Failed to log saved meal.');
    }
    setIsLoading(false);
  };

  return (
    <div className="saved-meals-list">
      <h4>Log from Saved Meals</h4>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {plans.length === 0 && !isLoading && <p>You have no saved meal plans.</p>}
      
      {plans.map((plan) => (
        <div key={plan.id} className="saved-plan-item">
          <strong>{plan.name}</strong>
          <button 
            onClick={() => handleLogPlan(plan.id)} 
            disabled={isLoading}
            style={{marginLeft: '10px'}}
          >
            Log
          </button>
          <ul>
            {plan.items.map((item, index) => (
              <li key={index} style={{fontSize: '0.8em'}}>
                {item.name} ({item.quantity_g}g)
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}