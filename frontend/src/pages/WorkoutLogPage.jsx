import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export default function WorkoutLogPage() {
  const { planId } = useParams(); // Get planId from URL
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState([]); // This holds the *log* exercises
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Load plan data if a planId is provided
  useEffect(() => {
    if (planId) {
      const loadPlan = async () => {
        setLoading(true);
        const res = await apiClient.get(`/workouts/plans/${planId}`);
        // Convert plan exercises to log exercises, ready to be filled
        const logExercises = res.data.exercises.map(ex => ({
          log_exercise_id: `${ex.exercise_id}-${Math.random()}`, // Temp ID
          exercise_id: ex.exercise_id,
          exercise_name: ex.name,
          sets: [] // Start with empty sets to be filled
        }));
        setExercises(logExercises);
        setLoading(false);
      };
      loadPlan();
    }
  }, [planId]);

  const addSet = (exerciseIndex) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ reps: 0, weight: 0 });
    setExercises(newExercises);
  };

  const updateSet = (exIndex, setIndex, field, value) => {
    const newExercises = [...exercises];
    newExercises[exIndex].sets[setIndex][field] = parseFloat(value) || 0;
    setExercises(newExercises);
  };

  const removeSet = (exIndex, setIndex) => {
    const newExercises = [...exercises];
    newExercises[exIndex].sets.splice(setIndex, 1);
    setExercises(newExercises);
  };

  // We need to be able to add an exercise ad-hoc
  // (You would reuse the ExerciseSearch component here)
  // For simplicity, we'll just focus on logging the plan for now.

  const handleSaveLog = async () => {
    setLoading(true);
    const payload = {
      date: selectedDate,
      notes: notes,
      exercises: exercises
    };
    try {
      await apiClient.post('/workouts/logs', payload);
      alert("Workout Logged!");
      navigate('/workouts/calendar'); // Go to calendar after logging
    } catch (err) {
      alert("Failed to save log.");
    }
    setLoading(false);
  };

  return (
    <div className="App-header" style={{ padding: '20px' }}>
      <Link to="/workouts" style={{ alignSelf: 'flex-start' }}><button>Back to Workout Hub</button></Link>
      <h1>Log Workout</h1>
      
      <div className="auth-form" style={{ width: '80%' }}>
        <label>Log Date:</label>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        
        <hr />
        
        {loading && <p>Loading plan...</p>}
        {exercises.length === 0 && !loading && <p>Start by adding an exercise or load a plan.</p>}
        
        {exercises.map((ex, exIndex) => (
          <div key={ex.log_exercise_id} className="log-exercise-item" style={{ border: '1px solid #555', padding: '10px', margin: '10px 0' }}>
            <h4>{ex.exercise_name}</h4>
            {ex.sets.map((set, setIndex) => (
              <div key={setIndex} className="log-set-item" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                Set {setIndex + 1}:
                <input type="number" placeholder="Weight (kg)" value={set.weight} onChange={e => updateSet(exIndex, setIndex, 'weight', e.target.value)} />
                <input type="number" placeholder="Reps" value={set.reps} onChange={e => updateSet(exIndex, setIndex, 'reps', e.target.value)} />
                <button onClick={() => removeSet(exIndex, setIndex)} style={{ background: '#e53e3e' }}>X</button>
              </div>
            ))}
            <button onClick={() => addSet(exIndex)} style={{ marginTop: '10px' }}>Add Set</button>
          </div>
        ))}
        
        <hr />
        <label>Notes:</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did the workout feel?" />
        
        <button onClick={handleSaveLog} disabled={loading} style={{ background: '#4CAF50', marginTop: '20px' }}>Save Workout Log</button>
      </div>
    </div>
  );
}