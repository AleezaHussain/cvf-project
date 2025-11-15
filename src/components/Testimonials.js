// src/components/Testimonials.js
import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      text: "RoadHealth AI has revolutionized how we monitor our city's infrastructure. The detection accuracy is impressive, and it has helped us prioritize repairs effectively.",
      author: "John Smith",
      position: "City Infrastructure Manager",
      initials: "JS"
    },
    {
      text: "The real-time processing capabilities have significantly reduced our response time to road hazards. This technology is a game-changer for urban planning.",
      author: "Maria Davis",
      position: "Transportation Director",
      initials: "MD"
    },
    {
      text: "Implementing RoadHealth AI has resulted in a 30% reduction in road maintenance costs. The severity scoring helps us allocate resources where they're needed most.",
      author: "Robert Johnson",
      position: "Public Works Director",
      initials: "RJ"
    }
  ];

  return (
    <section className="testimonials" id="testimonials">
      <h2>What Our Users Say</h2>
      <p>Hear from municipalities and organizations using our technology</p>
      
      <div className="testimonial-grid">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card">
            <div className="testimonial-text">
              {testimonial.text}
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">{testimonial.initials}</div>
              <div className="author-info">
                <h4>{testimonial.author}</h4>
                <p>{testimonial.position}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;