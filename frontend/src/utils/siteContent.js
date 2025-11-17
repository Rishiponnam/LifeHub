export const services = [
  {
    id: 'nutrition',
    title: 'Smart Nutrition',
    path: '/nutrition',
    description: "Fuel your body with precision using our AI-powered nutrition tracker. We don't just count calories; we analyze your meals using advanced Natural Language Processing. Whether you're snapping a photo or typing 'chicken and rice', our Gemini AI integration breaks down macros instantly. Maintain your personal food library, track your daily intake against dynamic goals, and visualize your nutritional balance to ensure every bite brings you closer to your physique goals.",
    subOptions: [
      { name: 'AI Meal Logger', path: '/nutrition/ai-logger' },
      { name: 'My Foods Library', path: '/nutrition/my-foods' },
      { name: 'Daily Summary', path: '/nutrition/summary' },
    ]
  },
  {
    id: 'workouts',
    title: 'Workout Planner',
    path: '/workouts',
    description: "Transform your physique with a workout logger designed for serious lifters. Create custom routines like 'Push/Pull/Legs' or 'Upper/Lower', dragging and dropping exercises from our master database. Log your sets, reps, and weights in real-time, tracking progressive overload with ease. Our calendar view keeps you accountable, providing a visual history of your consistency and dedication in the iron paradise.",
    subOptions: [
      { name: 'My Plans', path: '/workouts/plans' },
      { name: 'Log Workout', path: '/workouts/log' },
      { name: 'Calendar History', path: '/workouts/calendar' },
    ]
  },
  {
    id: 'guidance',
    title: 'AI Guidance',
    path: '/guidance',
    description: "Eliminate the guesswork with personalized Bulking, Cutting, and Recomposition strategies. Our system analyzes your biometric data to generate tailored plans that adjust as you progress. Get answers to complex fitness questions via our 'Ask LifeHub' assistant, and receive daily actionable tips to optimize your sleep, hydration, and recovery strategies.",
    subOptions: []
  },
  {
    id: 'analytics',
    title: 'Analytics',
    path: '/analytics',
    description: "Visualize your victory with deep-dive analytics. We aggregate data from your meal logs and workout sessions to present clear, interactive trends. Track your weekly calorie averages, monitor volume load progression, and identify plateaus before they happen. Turn raw data into actionable insights to refine your strategy and maximize your results.",
    subOptions: []
  },
  {
    id: 'progress',
    title: 'Progress Tracker',
    path: '/progress',
    description: "Document your journey beyond the scale. Upload progress photos to a secure, private gallery and compare your physique transformation over time. Track body weight trends, measurements, and mood to see the full picture of your health. Celebrate every milestone and stay motivated by seeing exactly how far you've come.",
    subOptions: []
  }
];