import React, { useState, useEffect } from 'react';
import darthVaderLight from '../assets/darth-vader.png'; 
import darthVaderDark from '../assets/darth-vaderB.png'; 
const ThemeToggleButton = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="theme-toggle-container">
      <label className="theme-toggle" aria-label="Alternar entre modo claro y oscuro">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleTheme}
          onTouchStart={toggleTheme} 
        />
        <span className="slider">
          <img
            src={darthVaderLight}
            alt="Lado Luminoso"
            className="theme-icon light-icon"
          />
          <img
            src={darthVaderDark}
            alt="Lado Oscuro"
            className="theme-icon dark-icon"
          />
        </span>
      </label>
    </div>
  );
};

export default ThemeToggleButton;