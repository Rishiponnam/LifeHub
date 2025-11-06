import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { Link } from 'react-router-dom';

// This is the modal component for editing a logged item
function EditItemModal({ item, date, onClose, onLogUpdated }) {
  const [formData, setFormData] = useState(item);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'name' ? value : parseFloat(value) || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await apiClient.put(
        `/nutrition/meals/log-item/${item.log_item_id}?log_date=${date}`,
        formData // Send the full updated item
      );
      onLogUpdated(response.data);
      onClose();
    } catch (err) {
      setError('Failed to update item.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content auth-form">
        <h4>Edit Logged Item</h4>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
          <label>Qty (g)</label>
          <input type="number" step="0.01" name="quantity_g" value={formData.quantity_g} onChange={handleChange} />
          <label>Calories</label>
          <input type="number" step="0.01" name="calories" value={formData.calories} onChange={handleChange} />
          <label>Protein</label>
          <input type="number" step="0.01" name="protein" value={formData.protein} onChange={handleChange} />
          <label>Carbs</label>
          <input type="number" step="0.01" name="carbs" value={formData.carbs} onChange={handleChange} />
          <label>Fat</label>
          <input type="number" step="0.01" name="fat" value={formData.fat} onChange={handleChange} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Page Component
export default function MealSummaryPage() {
  const [dailyLog, setDailyLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingItem, setEditingItem] = useState(null); // State to control the modal

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
    fetchDailyLog(selectedDate);
  }, [selectedDate]);

  const handleDelete = async (log_item_id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const response = await apiClient.delete("/nutrition/meals/log-item", {
        data: { date: selectedDate, log_item_id: log_item_id }
      });
      setDailyLog(response.data); // Refresh the log
    } catch (err) {
      setError("Failed to delete item.");
    }
  };

  const handleLogUpdated = (newLog) => {
    setDailyLog(newLog);
  };                                                                                                                                                      

  return (
    <div className="App-header" style={{ padding: '20px' }}>
      <Link to="/nutrition" style={{ alignSelf: 'flex-start' }}><button>Back to Nutrition</button></Link>
      <h1>Daily Meal Summary</h1>
      <input 
        type="date" 
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        style={{ padding: '10px' }}
      />
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {dailyLog && (
        <div className="summary-container" style={{ width: '80%', marginTop: '20px' }}>
          <h3>Total Macros for {selectedDate}</h3>
          <div className="totals-summary" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <h4>Kcal: {dailyLog.total_macros.calories.toFixed(0)}</h4>
            <h4>Protein: {dailyLog.total_macros.protein.toFixed(1)}g</h4>
            <h4>Carbs: {dailyLog.total_macros.carbs.toFixed(1)}g</h4>
            <h4>Fat: {dailyLog.total_macros.fat.toFixed(1)}g</h4>
          </div>
          
          <hr />
          <h3>Logged Items</h3>
          <div className="logged-items-list">
            {dailyLog.food_items.items.length === 0 ? <p>No items logged for this day.</p> : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Qty (g)</th>
                    <th>Calories (Kcal)</th>
                    <th>Protein (g)</th>
                    <th>Carbs (g)</th>
                    <th>Fat (g)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyLog.food_items.items.map((item) => (
                    <tr key={item.log_item_id}>
                      <td>{item.name}</td>
                      <td>{item.quantity_g.toFixed(0)}</td>
                      <td>{item.calories.toFixed(0)}</td>
                      <td>{item.protein.toFixed(1)}</td>
                      <td>{item.carbs.toFixed(1)}</td>
                      <td>{item.fat.toFixed(1)}</td>
                      <td>
                        <button onClick={() => setEditingItem(item)} style={{ fontSize: '0.8em', marginRight: '5px' }}>Edit</button>
                        <button onClick={() => handleDelete(item.log_item_id)} style={{ fontSize: '0.8em', background: '#e53e3e' }}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      
      {/* The Edit Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          date={selectedDate}
          onClose={() => setEditingItem(null)}
          onLogUpdated={(newLog) => {
            setDailyLog(newLog);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}