import React, { useEffect, useState } from 'react';
import garciasImage from '../assets/garciasporlacompra.png';
import popSound from '../assets/pop.mp3';

const ThankYouComponent = () => {
  const [audioPlayed, setAudioPlayed] = useState(false);

  const playSound = () => {
    const pop = new Audio(popSound);
    pop.volume = 0.4;
    pop.play().catch(() => {});
    setAudioPlayed(true);
  };

  useEffect(() => {
    if (audioPlayed) {
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 18000);
      return () => clearTimeout(timer);
    }
  }, [audioPlayed]);

  return (
    <div className="thank-you-container">
      <div className="animated-overlay"></div>

      <img src={garciasImage} alt="Funko Celebration" className="full-image" />

      <div className="center-content">
        <div className="thank-you-text">¡Gracias por tu compra!</div>

        {!audioPlayed && (
          <button
            onClick={playSound}
            className="play-sound-button"
            aria-label="Reproducir sonido de celebración"
          >
            🎉 Escuchar 🎉
          </button>
        )}
      </div>
    </div>
  );
};

export default ThankYouComponent;
