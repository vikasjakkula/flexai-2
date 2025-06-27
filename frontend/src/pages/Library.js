// src/pages/Library.js
import React, { useState, useEffect } from 'react';
import exercises from '../ExerciseList';
import InfiniteScroll from '../components/InfiniteScroll';
import LoadingPage from '../components/LoadingPage';

const Library = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div>
      <InfiniteScroll />
      <h1
        style={{
          background: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)',
          color: '#fff',
          padding: '24px 0',
          textAlign: 'center',
          borderRadius: '16px',
          margin: '32px auto 24px auto',
          maxWidth: '700px',
          fontWeight: 600,
          letterSpacing: '2px',
          boxShadow: '0 4px 24px rgba(0, 114, 255, 0.10)',
          fontFamily: "'Montserrat', 'Poppins', Arial, sans-serif", fontWeight: 700
        }}
      >
        CHOOSE YOUR FLEX MUSCLE To START WORKOUT
      </h1>
      <div className="exercise-grid">
        {exercises.map((exercise, index) => (
          <div key={index} className="exercise-card">
            <h1>{exercise.name}</h1>
            <video width="320" height="240" autoPlay loop muted playsInline>
              <source src={exercise.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
