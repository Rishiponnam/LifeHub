import { useState } from 'react';
import apiClient from '../api/apiClient';
import { Link } from 'react-router-dom';

// This is the new editable item form
function EditableLogItem({ item, onUpdate, index }) {
  const [data, setData] = useState(item);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedItem = { ...data, [name]: name === 'name' ? value : parseFloat(value) || 0 };
    setData(updatedItem);
    onUpdate(index, updatedItem); // Update the parent's state
  };

  return (
    <div className="editable-item" style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '10px' }}>
      <input type="text" name="name" value={data.name} onChange={handleChange} style={{ flex: 2 }} />
      <input type="number" step="0.01" name="quantity_g" value={data.quantity_g} onChange={handleChange} style={{ flex: 1 }} />
      <input type="number" step="0.01" name="calories" value={data.calories} onChange={handleChange} style={{ flex: 1 }} />
      <input type="number" step="0.01" name="protein" value={data.protein} onChange={handleChange} style={{ flex: 1 }} />
      <input type="number" step="0.01" name="carbs" value={data.carbs} onChange={handleChange} style={{ flex: 1 }} />
      <input type="number" step="0.01" name="fat" value={data.fat} onChange={handleChange} style={{ flex: 1 }} />
    </div>
  );
}

export default function AILoggerPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editableItems, setEditableItems] = useState([]); // This is the new state
  
  const selectedDate = new Date().toISOString().split('T')[0]; // Log to today

  const handleAnalyze = async () => {
    if (!query) return;
    setIsLoading(true);
    setError('');
    setEditableItems([]);
    try {
      const response = await apiClient.post('/nutrition/nutrition/analyze', { query });
      setEditableItems(response.data.items); // Set the editable items
    } catch (err) {
      setError('Failed to analyze meal. Please try a different query.');
    }
    setIsLoading(false);
  };

  const handleItemUpdate = (index, updatedItem) => {
    const newItems = [...editableItems];
    newItems[index] = updatedItem;
    setEditableItems(newItems);
  };

  const handleLogMeal = async () => {
    if (!editableItems.length) return;
    setIsLoading(true);
    try {
      const logPayload = {
        items_to_log: editableItems // Log the *edited* items
      };
      
      await apiClient.post(`/nutrition/meals/log?log_date=${selectedDate}`, logPayload);
      
      setQuery('');
      setEditableItems([]);
      alert(`Logged ${editableItems.length} items for today!`);
      
    } catch (err) {
      setError('Failed to log meal.');
    }
    setIsLoading(false);
  };

  return (
    <div className="App-header" style={{ padding: '20px' }}>
      <Link to="/nutrition" style={{ alignSelf: 'flex-start' }}><button>Back to Nutrition</button></Link>
      <h1>AI Meal Logger</h1>
      <div className="meal-logger" style={{ width: '80%' }}>
        <h4>Log All Meals for Today ({selectedDate})</h4>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Breakfast 110g of brown bread... Lunch 350g of rice..."
          rows={5}
          disabled={isLoading}
          style={{ width: '100%' }}
        />
        <button onClick={handleAnalyze} disabled={isLoading || !query} style={{ width: '100%', padding: '10px' }}>
          {isLoading ? 'Analyzing...' : 'Analyze Meal'}
        </button>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {editableItems.length > 0 && (
          <div className="analysis-preview" style={{ marginTop: '20px' }}>
            <h4>Analysis Results (Editable)</h4>
            <div style={{ display: 'flex', gap: '5px', fontSize: '0.8em', paddingLeft: '10px' }}>
              <span style={{ flex: 2 }}>Name</span>
              <span style={{ flex: 1 }}>Qty (g)</span>
              <span style={{ flex: 1 }}>Kcal</span>
              <span style={{ flex: 1 }}>Protein</span>
              <span style={{ flex: 1 }}>Carbs</span>
              <span style={{ flex: 1 }}>Fat</span>
            </div>
            {editableItems.map((item, index) => (
              <EditableLogItem
                key={item.log_item_id}
                item={item}
                index={index}
                onUpdate={handleItemUpdate}
              />
            ))}
            <button onClick={handleLogMeal} disabled={isLoading} style={{ width: '100%', padding: '10px', background: '#4CAF50' }}>
              Confirm & Log All Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}