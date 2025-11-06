import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { Link } from 'react-router-dom';

// We can move CreateFoodForm to its own component file,
// but for simplicity, I'll keep it here.
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
      const payload = {
        name: formData.name,
        calories_per_100g: parseFloat(formData.calories_per_100g),
        protein_per_100g: parseFloat(formData.protein_per_100g),
        carbs_per_100g: parseFloat(formData.carbs_per_100g),
        fat_per_100g: parseFloat(formData.fat_per_100g),
      };
      
      await apiClient.post('/nutrition/foods', payload);
      alert('Food saved!');
      onFoodCreated(); // This will trigger a refresh
      setFormData({ name: '', calories_per_100g: '', protein_per_100g: '', carbs_per_100g: '', fat_per_100g: '' });
      
    } catch (err) {
      setError('Failed to save food. Check all fields.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-food-form auth-form">
      <h4>Create a Custom Food Item</h4>
      <p>All values should be per 100g.</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input name="name" placeholder="Food Name" value={formData.name} onChange={handleChange} required />
      {/* Use step="0.01" to allow decimals */}
      <input name="calories_per_100g" type="number" step="0.01" placeholder="Calories" value={formData.calories_per_100g} onChange={handleChange} required />
      <input name="protein_per_100g" type="number" step="0.01" placeholder="Protein (g)" value={formData.protein_per_100g} onChange={handleChange} required />
      <input name="carbs_per_100g" type="number" step="0.01" placeholder="Carbs (g)" value={formData.carbs_per_100g} onChange={handleChange} required />
      <input name="fat_per_100g" type="number" step="0.01" placeholder="Fat (g)" value={formData.fat_per_100g} onChange={handleChange} required />
      <button type="submit">Save to My Foods</button>
    </form>
  );
}

// Main Page Component
export default function MyFoodsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [logError, setLogError] = useState('');
  const [logSuccess, setLogSuccess] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Used to refresh search
  
  const selectedDate = new Date().toISOString().split('T')[0]; // Log to today

  useEffect(() => {
    // FIX: Search from 1+ letter
    if (searchQuery.length < 1) {
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
    }, 250); // Faster debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, refreshKey]); // Refresh search when refreshKey changes

  const handleLogFood = async (food) => {
    const quantityStr = prompt(`How many grams of ${food.name} did you have?`, "100");
    const quantity_g = parseFloat(quantityStr);

    if (!quantity_g || quantity_g <= 0) return;

    setLogError('');
    setLogSuccess('');
    try {
      const scale = quantity_g / 100.0;
      const loggedItem = {
        name: food.name,
        quantity_g: quantity_g,
        calories: food.calories_per_100g * scale,
        protein: food.protein_per_100g * scale,
        carbs: food.carbs_per_100g * scale,
        fat: food.fat_per_100g * scale,
      };

      await apiClient.post(
        `/nutrition/meals/log?log_date=${selectedDate}`,
        { items_to_log: [loggedItem] }
      );
      
      setLogSuccess(`Logged ${quantity_g}g of ${food.name}!`);
      setSearchQuery('');
      setSearchResults([]);

    } catch (err) {
      setLogError('Failed to log food.');
    }
  };

  return (
    <div className="App-header" style={{ padding: '20px' }}>
      <Link to="/nutrition" style={{ alignSelf: 'flex-start' }}><button>Back to Nutrition</button></Link>
      <h1>Log from "My Foods"</h1>
      
      <div className="my-foods-container" style={{ display: 'flex', width: '100%', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <CreateFoodForm onFoodCreated={() => setRefreshKey(k => k + 1)} />
        </div>
        
        <div style={{ flex: 1 }}>
          <h4>Log Food for Today ({selectedDate})</h4>
          <input
            type="search"
            placeholder="Search your saved foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
          />
          {logError && <p style={{ color: 'red' }}>{logError}</p>}
          {logSuccess && <p style={{ color: 'green' }}>{logSuccess}</p>}
          
          <div className="search-results" style={{ marginTop: '10px' }}>
            {searchResults.map((food) => (
              <div key={food.id} className="search-result-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #444' }}>
                <span>{food.name} ({parseFloat(food.calories_per_100g).toFixed(0)} kcal/100g)</span>
                <button onClick={() => handleLogFood(food)}>Log</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}