// src/components/Newsletter.js
import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  return (
    <section className="newsletter">
      <h2>Stay Updated</h2>
      <p>Subscribe to our newsletter for the latest updates on road health technology</p>
      
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="newsletter-input"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="newsletter-btn">Subscribe</button>
      </form>
    </section>
  );
};

export default Newsletter;