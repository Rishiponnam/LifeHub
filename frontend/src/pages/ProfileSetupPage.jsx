import { useState } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { createProfile } from '../store/authSlice';

export default function ProfileSetupPage() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    age: '', height: '', weight: '',
    goal: 'maintain_weight', activity_level: 'sedentary',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const profileData = {
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        goal: formData.goal,
        activity_level: formData.activity_level,
      };

      // --- DISPATCH CREATE PROFILE THUNK ---
      await dispatch(createProfile(profileData)).unwrap();
      // No navigation needed, ProtectedRoute will see the user.profile
      // is now filled and will automatically redirect to '/'

    } catch (err) {
      console.error('Failed to create profile:', err);
    }
  };

  return (
    <div className="App-header">
      <h1>Complete Your Profile</h1>
      <p>Welcome, {user.full_name}! Let's get some basic info.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
        <input type="number" name="height" placeholder="Height (cm)" value={formData.height} onChange={handleChange} required />
        <input type="number" name="weight" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required />
        
        <select name="goal" value={formData.goal} onChange={handleChange}>
          <option value="lose_weight">Lose Weight</option>
          <option value="maintain_weight">Maintain Weight</option>
          <option value="gain_muscle">Gain Muscle</option>
        </select>
        
        <select name="activity_level" value={formData.activity_level} onChange={handleChange}>
          <option value="sedentary">Sedentary (office job)</option>
          <option value="lightly_active">Lightly Active (1-2 days/week)</option>
          <option value="moderately_active">Moderately Active (3-5 days/week)</option>
          <option value="very_active">Very Active (6-7 days/week)</option>
          <option value="extra_active">Extra Active (physical job)</option>
        </select>
        
        <button type="submit">Save Profile</button>
        {error && <p className="message">{error}</p>}
      </form>
    </div>
  );
}