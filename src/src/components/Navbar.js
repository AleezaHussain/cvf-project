// src/components/Navbar.js
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const Navbar = ({ activeSection, setActiveSection }) => {
  const { isLightMode, toggleTheme } = useTheme();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'upload', label: 'Upload' },
    { id: 'stats', label: 'Stats' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav>
      <div className="logo">RoadHealth AI</div>
      <ul>
        {navItems.map(item => (
          <li key={item.id}>
            <a 
              href={`#${item.id}`}
              className={activeSection === item.id ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.id);
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
        <li>
          <div className="theme-toggle" onClick={toggleTheme}>
            <i className="fas fa-sun"></i>
            <i className="fas fa-moon"></i>
            <div className={`toggle-circle ${isLightMode ? 'light' : ''}`}></div>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;