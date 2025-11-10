import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { Link } from 'react-router-dom';

// Reusable Exercise Search Component
function ExerciseSearch({ onSelectExercise }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }
    const fetch = async () => {
      const res = await apiClient.get(`/workouts/exercises/search?query=${query}`);
      setResults(res.data);
    };
    const timer = setTimeout(fetch, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="exercise-search">
      <input
        type="text"
        placeholder="Search for an exercise..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="search-results">
        {results.map(ex => (
          <div key={ex.id} className="search-result-item">
            <span>{ex.name} ({ex.muscle_group})</span>
            <button onClick={() => { onSelectExercise(ex); setQuery(''); setResults([]); }}>Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Page
export default function WorkoutPlansPage() {
  const [plans, setPlans] = useState([]);
  const [planName, setPlanName] = useState('');
  const [goalType, setGoalType] = useState('general');
  const [exercises, setExercises] = useState([]); // For the *new* plan

  const fetchPlans = async () => {
    const res = await apiClient.get('/workouts/plans');
    setPlans(res.data);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const addExerciseToPlan = (exercise) => {
    // Add new exercise with default sets/reps
    setExercises([...exercises, {
      exercise_id: exercise.id,
      name: exercise.name,
      sets: 3,
      reps: '8-10'
    }]);
  };

  const updateExercise = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!planName || exercises.length === 0) {
      alert("Please provide a plan name and add at least one exercise.");
      return;
    }
    const payload = {
      name: planName,
      goal_type: goalType,
      exercises: exercises
    };
    await apiClient.post('/workouts/plans', payload);
    // Reset form and refresh list
    setPlanName('');
    setExercises([]);
    fetchPlans();
  };
  
  const handleDeletePlan = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      await apiClient.delete(`/workouts/plans/${planId}`);
      fetchPlans();
    }
  };

  return (
    <div className="App-header" style={{ padding: '20px' }}>
      <Link to="/workouts" style={{ alignSelf: 'flex-start' }}><button>Back to Workout Hub</button></Link>
      <h1>My Workout Plans</h1>
      
      <div style={{ display: 'flex', width: '100%', gap: '20px' }}>
        {/* --- Left Column: Create New Plan --- */}
        <div style={{ flex: 1 }} className="auth-form">
          <h3>Create New Plan</h3>
          <form onSubmit={handleSavePlan}>
            <input type="text" placeholder="Plan Name (e.g., Push Day)" value={planName} onChange={e => setPlanName(e.target.value)} required />
            <select value={goalType} onChange={e => setGoalType(e.target.value)}>
              <option value="general">General</option>
              <option value="strength">Strength</option>
              <option value="hypertrophy">Hypertrophy</option>
              <option value="endurance">Endurance</option>
            </select>
            
            <hr />
            <h4>Add Exercises</h4>
            <ExerciseSearch onSelectExercise={addExerciseToPlan} />
            
            <div className="plan-exercises-list" style={{ marginTop: '15px' }}>
              {exercises.map((ex, index) => (
                <div key={index} className="plan-exercise-item">
                  <strong>{ex.name}</strong>
                  <button type="button" onClick={() => removeExercise(index)} style={{ float: 'right' }}>X</button>
                  <div>
                    Sets: <input type="number" value={ex.sets} onChange={e => updateExercise(index, 'sets', parseInt(e.target.value))} style={{ width: '60px' }} />
                    Reps: <input type="text" value={ex.reps} onChange={e => updateExercise(index, 'reps', e.target.value)} style={{ width: '80px' }} />
                  </div>
                </div>
              ))}
            </div>
            
            <button type="submit" style={{ marginTop: '20px' }}>Save Plan</button>
          </form>
        </div>

        {/* --- Right Column: My Saved Plans --- */}
        <div style={{ flex: 1 }}>
          <h3>My Saved Plans</h3>
          <div className="saved-plans-list">
            {plans.length === 0 && <p>You have no saved plans.</p>}
            {plans.map(plan => (
              <div key={plan.id} className="service-card enabled" style={{ marginBottom: '10px' }}>
                <h4>{plan.name} ({plan.goal_type})</h4>
                <ul>{plan.exercises.map((ex, i) => <li key={i}>{ex.name} ({ex.sets} sets of {ex.reps} reps)</li>)}</ul>
                <Link to={`/workouts/log/${plan.id}`}><button>Start this Workout</button></Link>
                <button onClick={() => handleDeletePlan(plan.id)} style={{ background: '#e53e3e', marginLeft: '10px' }}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}