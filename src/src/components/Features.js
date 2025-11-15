// src/components/Features.js
import React from 'react';

const Features = () => {
  const features = [
    {
      title: 'Crack Detection',
      description: 'Detects line-based and surface cracks with high accuracy.'
    },
    {
      title: 'Pothole Localization',
      description: 'Identifies potholes and marks their exact location.'
    },
    {
      title: 'Severity Scoring',
      description: 'Rates road damage severity for maintenance planning.'
    },
    {
      title: 'Real-Time Processing',
      description: 'Fast detection suitable for smart-city traffic systems.'
    }
  ];

  return (
    <section className="features" id="features">
      <h2>Our Features</h2>
      <div className="feature-grid">
        {features.map((feature, index) => (
          <div key={index} className="card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;