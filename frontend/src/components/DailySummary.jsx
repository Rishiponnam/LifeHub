import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function DailySummary({ log }) {

  if (!log) {
    throw new Error('Log data is missing!'); // Manually throw an error for testing
  }

  const { total_macros = {}, food_items = {} } = log;
  const { calories, protein, carbs, fat } = total_macros;
  const { items = [] } = food_items;

  // Chart.js data
  const macroData = {
    labels: [`Protein (${protein.toFixed(1)}g)`, `Carbs (${carbs.toFixed(1)}g)`, `Fat (${fat.toFixed(1)}g)`],
    datasets: [
      {
        label: 'Macro Split (grams)',
        data: [protein, carbs, fat],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // A check to render the chart only if there's data
  const hasData = protein > 0 || carbs > 0 || fat > 0;

  return (
    <div className="daily-summary">
      <h3>Summary for {log.date}</h3>
      <h4>Total Calories: {calories.toFixed(0)}</h4>
      
      <div style={{ maxWidth: '300px', margin: 'auto' }}>
        {hasData ? (
          <Pie data={macroData} />
        ) : (
          <p>No data logged for this day.</p>
        )}
      </div>

      <h4>Logged Items:</h4>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.name} ({item.quantity_g}g) - {item.calories.toFixed(0)} kcal
          </li>
        ))}
      </ul>
    </div>
  );
}

// export function DailySummary({ log }) {
//   if (!log) return <div>No log data available</div>;

//   const { food_items, total_macros } = log;

//   // If food_items is an object, render it correctly
//   const foodItemsList = food_items.items ? (
//     <ul>
//       {food_items.items.map((item, index) => (
//         <li key={index}>
//           {item.name}: {item.quantity_g}g, {item.calories} kcal
//         </li>
//       ))}
//     </ul>
//   ) : (
//     <div>No food items available.</div>
//   );

//   // Total macros
//   const totalMacros = total_macros ? (
//     <div>
//       <p>Calories: {total_macros.calories}</p>
//       <p>Protein: {total_macros.protein}g</p>
//       <p>Carbs: {total_macros.carbs}g</p>
//       <p>Fat: {total_macros.fat}g</p>
//     </div>
//   ) : (
//     <div>No total macros available.</div>
//   );

//   return (
//     <div>
//       <h3>Daily Summary for {log.date}</h3>
//       {foodItemsList}
//       {totalMacros}
//     </div>
//   );
// }