import React from 'react';
import '../index.css';
import TiendaImg from '../assets/Tienda.jpg';
import FunkosImg from '../assets/Funkos.jpg';

function AboutUs() {
  return (
    <div className="about-us-container">
      <section className="about-us-section" style={{ '--index': 0 }}>
        <h2 className="about-us-subtitle">¡Descubre ImportFunko!</h2>
        <p className="about-us-text">
          Somos ImportFunko, tu destino favorito para coleccionar Funko Pops únicos y originales. Nos apasiona traer a tus manos las figuras más icónicas de tus personajes favoritos, desde héroes de cómics hasta leyendas del cine y la música. Nuestra misión es convertir cada compra en una aventura épica, ofreciéndote productos auténticos, ediciones exclusivas y un servicio que hará que tu colección brille como nunca.
        </p>
        <div className="about-us-image-container">
          <img src={TiendaImg} alt="Fachada de ImportFunko" className="about-us-image" />
        </div>
      </section>

      <section className="about-us-section" style={{ '--index': 1 }}>
        <h2 className="about-us-subtitle">El Origen de la Funko-Manía</h2>
        <p className="about-us-text">
          ImportFunko nació del sueño de un grupo de coleccionistas que querían compartir su amor por los Funko Pops con el mundo. Lo que empezó como una pequeña idea se ha convertido en una comunidad vibrante gracias a la pasión de nuestros clientes y nuestro compromiso con la calidad. Hoy, seguimos cazando las figuras más raras y emocionantes para que tu vitrina sea el reflejo de tus fandoms favoritos.
        </p>
        <div className="about-us-image-container">
          <img src={FunkosImg} alt="Pila de Funko Pops" className="about-us-image" />
        </div>
      </section>
    </div>
  );
}

export default AboutUs;