import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import apiClient from '../api/apiClient';
import { Link } from 'react-router-dom';

// Helper to format date as YYYY-MM-DD
const toYYYYMMDD = (date) => date.toISOString().split('T')[0];

export default function WorkoutCalendarPage() {
  const [date, setDate] = useState(new Date());
  const [logs, setLogs] = useState({}); // Stores logs keyed by date string
  const [selectedLog, setSelectedLog] = useState(null);

  // Function to fetch logs for a given month
  const fetchLogs = async (viewDate) => {
    const startDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const endDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    
    try {
      const res = await apiClient.get(`/workouts/logs?start_date=${toYYYYMMDD(startDate)}&end_date=${toYYYYMMDD(endDate)}`);
      
      // Map logs to a dictionary for easy lookup
      const logsByDate = res.data.reduce((acc, log) => {
        acc[log.date] = log;
        return acc;
      }, {});
      setLogs(logsByDate);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  // Fetch logs when component mounts or view changes
  useEffect(() => {
    fetchLogs(date);
  }, [date]); // Re-fetch when the base date changes

  const handleDeleteLog = async (logId) => {
    if (window.confirm("Delete this workout log?")) {
      await apiClient.delete(`/workouts/logs/${logId}`);
      setSelectedLog(null); // Close modal
      fetchLogs(date); // Refresh calendar
    }
  };

  return (
    <div className="App-header" style={{ padding: '20px' }}>
      <Link to="/workouts" style={{ alignSelf: 'flex-start' }}><button>Back to Workout Hub</button></Link>
      <h1>Workout Calendar</h1>
      
      <div style={{ display: 'flex', gap: '20px', width: '90%' }}>
        {/* --- Left: Calendar --- */}
        <div style={{ flex: 2 }}>
          <Calendar
            onChange={setDate}
            value={date}
            onActiveStartDateChange={({ activeStartDate }) => fetchLogs(activeStartDate)}
            onClickDay={(value) => setSelectedLog(logs[toYYYYMMDD(value)] || null)}
            tileContent={({ date, view }) => {
              // Add a dot if a log exists for this date
              if (view === 'month' && logs[toYYYYMMDD(date)]) {
                return <div style={{ height: '5px', width: '5px', background: '#3b82f6', borderRadius: '50%', margin: 'auto' }}></div>;
              }
              return null;
            }}
          />
        </div>
        
        {/* --- Right: Log Details --- */}
        <div style={{ flex: 1, background: '#2a2a2a', padding: '20px', borderRadius: '8px' }}>
          <h4>Log Details</h4>
          {selectedLog ? (
            <div>
              <strong>Date: {selectedLog.date}</strong>
              <button onClick={() => handleDeleteLog(selectedLog.id)} style={{ float: 'right', background: '#e53e3e' }}>Delete</button>
              <p><strong>Notes:</strong> {selectedLog.notes || 'None'}</p>
              <h5>Exercises:</h5>
              <ul>
                {selectedLog.exercises.map((ex) => (
                  <li key={ex.log_exercise_id}>
                    <strong>{ex.exercise_name}</strong>
                    <ul>{ex.sets.map((set, i) => <li key={i}>Set {i+1}: {set.weight}kg x {set.reps} reps</li>)}</ul>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Select a day with a workout to see details.</p>
          )}
        </div>
      </div>
    </div>
  );
}