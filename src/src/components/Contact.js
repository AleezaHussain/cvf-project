// src/components/Contact.js
import React from 'react';

const Contact = () => {
  const contactInfo = [
    {
      title: 'Email',
      content: 'support@roadhealth.ai'
    },
    {
      title: 'Phone',
      content: '+92 345 9876879'
    },
    {
      title: 'Office Address',
      content: 'University Road, Software Department, Ground Floor'
    }
  ];

  return (
    <section id="contact">
      <h2>Contact Us</h2>
      <p>Have questions? Reach out to us anytime.</p>
      <div className="contact-grid">
        {contactInfo.map((info, index) => (
          <div key={index} className="contact-card">
            <h3>{info.title}</h3>
            <p>{info.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Contact;