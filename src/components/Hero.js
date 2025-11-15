// src/components/Hero.js
import React from 'react';
import RoadVisualization from './RoadVisualization';

const Hero = () => {
  const scrollToUpload = () => {
    const element = document.getElementById('upload');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="container" id="home">
      <h1>Road Health Detection System</h1>
      <p>An AI-powered platform that identifies cracks, potholes, and road damage to support safer and smarter urban infrastructure.</p>
      <button className="btn" onClick={scrollToUpload}>Start Detection</button>
      
      {/* Mission Statement */}
      <div className="mission-statement">
        <h3>AIM-K: Revolutionizing Pakistan's Road Maintenance</h3>
        <p>Pakistan's roads are plagued by cracks and potholes, but manual inspection is slow and inefficient. Our automated system uses advanced AI to detect damage instantly, making road maintenance faster, safer, and more cost-effective for the nation.</p>
      </div>
      
      {/* Enhanced Road Visualization */}
      <RoadVisualization />
    </section>
  );
};

export default Hero;