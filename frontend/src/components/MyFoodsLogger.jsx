import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export function MyFoodsLogger({ selectedDate, onMealLogged }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [logError, setLogError] = useState('');

  // Search for foods as the user types
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await apiClient.get(`/nutrition/foods/search?query=${searchQuery}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error("Failed to search foods:", error);
      }
    }, 300); // Debounce to avoid spamming API

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleLogFood = async (food) => {
    const quantityStr = prompt(`How many grams of ${food.name} did you have?`, 100);
    const quantity_g = parseFloat(quantityStr);

    if (!quantity_g || quantity_g <= 0) return; // User cancelled or entered invalid number

    setLogError('');
    try {
      // Calculate macros for the specific quantity
      const scale = quantity_g / 100.0;
      const loggedItem = {
        name: food.name,
        quantity_g: quantity_g,
        calories: food.calories_per_100g * scale,
        protein: food.protein_per_100g * scale,
        carbs: food.carbs_per_100g * scale,
        fat: food.fat_per_100g * scale,
      };

      // Use the same endpoint as the AI logger
      const response = await apiClient.post(
        `/nutrition/meals/log?log_date=${selectedDate}`,
        { items_to_log: [loggedItem] } // Send as a list of items
      );
      
      onMealLogged(response.data); // Update the daily summary
      setSearchQuery('');
      setSearchResults([]);

    } catch (err) {
      setLogError('Failed to log food.');
    }
  };

  return (
    <div className="my-foods-logger">
      <h4>Log from "My Foods"</h4>
      <input
        type="search"
        placeholder="Search your saved foods..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {logError && <p style={{ color: 'red' }}>{logError}</p>}
      
      <div className="search-results">
        {searchResults.map((food) => (
          <div key={food.id} className="search-result-item">
            <span>{food.name} ({food.calories_per_100g} kcal/100g)</span>
            <button onClick={() => handleLogFood(food)}>Log</button>
          </div>
        ))}
      </div>

      <hr style={{ margin: '20px 0' }} />

      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create New Food'}
      </button>

      {showCreateForm && <CreateFoodForm onFoodCreated={() => setShowCreateForm(false)} />}
    </div>
  );
}

// A helper form component
function CreateFoodForm({ onFoodCreated }) {
  const [formData, setFormData] = useState({
    name: '', calories_per_100g: '', protein_per_100g: '', carbs_per_100g: '', fat_per_100g: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Convert to numbers
      const payload = {
        name: formData.name,
        calories_per_100g: parseFloat(formData.calories_per_100g),
        protein_per_100g: parseFloat(formData.protein_per_100g),
        carbs_per_100g: parseFloat(formData.carbs_per_100g),
        fat_per_100g: parseFloat(formData.fat_per_100g),
      };
      
      await apiClient.post('/nutrition/foods', payload);
      alert('Food saved to "My Foods"!');
      onFoodCreated(); // Close the form
      
    } catch (err) {
      setError('Failed to save food. Check all fields.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-food-form">
      <h4>Create a Custom Food Item</h4>
      <p>All values should be per 100g.</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input name="name" placeholder="Food Name (e.g., My Protein Shake)" onChange={handleChange} required />
      <input name="calories_per_100g" type="number" placeholder="Calories" onChange={handleChange} required />
      <input name="protein_per_100g" type="number" placeholder="Protein (g)" onChange={handleChange} required />
      <input name="carbs_per_100g" type="number" placeholder="Carbs (g)" onChange={handleChange} required />
      <input name="fat_per_100g" type="number" placeholder="Fat (g)" onChange={handleChange} required />
      <button type="submit">Save to My Foods</button>
    </form>
  );
}