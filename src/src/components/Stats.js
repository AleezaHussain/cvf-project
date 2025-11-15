// src/components/Stats.js
import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

const Stats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const stats = [
    { id: 'roads-scanned', end: 12458, label: 'Roads Scanned' },
    { id: 'cracks-detected', end: 8742, label: 'Cracks Detected' },
    { id: 'potholes-found', end: 3219, label: 'Potholes Found' },
    { id: 'cities-covered', end: 47, label: 'Cities Covered' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  // Initialize chart when component becomes visible
  useEffect(() => {
    if (isVisible && chartRef.current) {
      console.log('Initializing chart...');
      
      // Destroy previous chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Cracks Detected',
            data: [320, 450, 380, 520, 610, 730],
            backgroundColor: 'rgba(33, 150, 243, 0.7)',
            borderColor: 'rgba(33, 150, 243, 1)',
            borderWidth: 1
          }, {
            label: 'Potholes Found',
            data: [120, 180, 150, 210, 240, 290],
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'white'
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'white'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'white',
                font: {
                  size: 14
                }
              }
            }
          }
        }
      });

      // Animate stats
      stats.forEach(stat => {
        animateValue(stat.id, 0, stat.end, 2000);
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [isVisible]);

  const animateValue = (id, start, end, duration) => {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      obj.innerHTML = value.toLocaleString();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  return (
    <section className="stats-section" id="stats" ref={statsRef}>
      <h2>Road Health Statistics</h2>
      <p>Real-time data on road conditions and detection results</p>
      
      <div className="stats-container">
        {stats.map(stat => (
          <div key={stat.id} className="stat-card">
            <div className="stat-number" id={stat.id}>0</div>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>
      
      <div className="chart-container">
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--accent-color)' }}>
          Monthly Damage Detection
        </h3>
        <div style={{ height: '400px', width: '100%' }}>
          <canvas 
            ref={chartRef} 
            style={{ 
              width: '100% !important', 
              height: '100% !important',
              display: 'block'
            }}
          ></canvas>
        </div>
      </div>
    </section>
  );
};

export default Stats;