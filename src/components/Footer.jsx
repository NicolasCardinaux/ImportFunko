import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faFacebook } from "@fortawesome/free-brands-svg-icons";
import logo from "../assets/logo.png";
import xIcon from "../assets/x.png";
import { useAuth } from "../context/AuthContext";
import "../index.css";

const Footer = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleHomeRedirect = () => {
    navigate("/");
    window.scrollTo(0, 0);
  };

  const handleFavoritesRedirect = () => {
    navigate("/favoritos");
    window.scrollTo(0, 0);
  };

  const handleCartRedirect = () => {
    navigate("/cart");
    window.scrollTo(0, 0);
  };

  const handleMyPurchasesRedirect = () => {
    navigate("/my-purchases"); 
    window.scrollTo(0, 0);
  };

  const handleMyDataRedirect = () => {
    navigate("/mis-datos");
    window.scrollTo(0, 0);
  };

  const handleAboutUsRedirect = () => {
    navigate("/quienes-somos");
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer">
      <hr className="footer__separator" />
      <div className="footer__top">
        <div className="footer__info">
          <Link to="/" className="footer__title-button no-underline" onClick={handleHomeRedirect}>
            <img src={logo} alt="Logo" className="footer__logo" />
            <span>ImportFunko</span>
          </Link>
          <p className="footer__location">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="footer__icon" />
            Concepción del Uruguay, Entre Ríos, Argentina
          </p>
          <div className="footer__map">
            <a
              href="https://www.google.com/maps/place/Concepción+del+Uruguay,+Entre+Ríos,+Argentina/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__map-link"
            >
              <iframe
                title="Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2793.724413517593!2d-58.2392044!3d-32.4833501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95afdb9bff746e77%3A0x512d1ab59b1bc1bb!2sConcepción+del+Uruguay%2C+Entre+Ríos%2C+Argentina!5e0!3m2!1ses-419!2sar!4v1699112458448!5m2!1ses-419!2sar"
                width="200"
                height="150"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </a>
          </div>
        </div>

        <div className="footer__links">
          <p className="footer__links-title">Enlaces:</p>
          <ul className="footer__link-list">
            {isAuthenticated ? (
              <>
                {/* Versión escritorio */}
                <li className="footer__link-item footer__link-item--desktop">
                  <button onClick={handleHomeRedirect} className="footer__link-button">
                    Tienda
                  </button>
                  <button onClick={handleMyPurchasesRedirect} className="footer__link-button">
                    Mis compras
                  </button>
                </li>
                <li className="footer__link-item footer__link-item--desktop">
                  <button onClick={handleCartRedirect} className="footer__link-button">
                    Carrito
                  </button>
                  <button onClick={handleMyDataRedirect} className="footer__link-button">
                    Mis datos
                  </button>
                </li>
                <li className="footer__link-item footer__link-item--desktop">
                  <button onClick={handleFavoritesRedirect} className="footer__link-button">
                    Favoritos
                  </button>
                  <button
                    onClick={handleAboutUsRedirect}
                    className={`footer__link-button quienes-somos-button ${isAuthenticated ? "registered" : ""}`}
                  >
                    ¡Descubre ImportFunko!
                  </button>
                </li>
                
                {/* Versión móvil */}
                <li className="footer__link-item footer__link-item--mobile">
                  <button onClick={handleHomeRedirect} className="footer__link-button">
                    Tienda
                  </button>
                </li>
                <li className="footer__link-item footer__link-item--mobile">
                  <button onClick={handleCartRedirect} className="footer__link-button">
                    Carrito
                  </button>
                </li>
                <li className="footer__link-item footer__link-item--mobile">
                  <button onClick={handleFavoritesRedirect} className="footer__link-button">
                    Favoritos
                  </button>
                </li>
                <li className="footer__link-item footer__link-item--mobile">
                  <button onClick={handleMyPurchasesRedirect} className="footer__link-button">
                    Mis compras
                  </button>
                </li>
                <li className="footer__link-item footer__link-item--mobile">
                  <button onClick={handleMyDataRedirect} className="footer__link-button">
                    Mis datos
                  </button>
                </li>
                <li className="footer__link-item footer__link-item--mobile">
                  <button
                    onClick={handleAboutUsRedirect}
                    className={`footer__link-button quienes-somos-button ${isAuthenticated ? "registered" : ""}`}
                  >
                    ¡Descubre ImportFunko!
                  </button>
                </li>
              </>
            ) : (
              <li className="footer__link-item footer__link-item--unauthenticated">
                <button onClick={handleHomeRedirect} className="footer__link-button">
                  Tienda
                </button>
                <button
                  onClick={handleAboutUsRedirect}
                  className={`footer__link-button quienes-somos-button ${isAuthenticated ? "registered" : ""}`}
                >
                  ¡Descubre ImportFunko!
                </button>
              </li>
            )}
            <li className="footer__link-item">
              <p className="footer__links-title">Redes:</p>
              <div className="footer__social-media">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                >
                  <FontAwesomeIcon icon={faInstagram} className="footer__social-icon" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                >
                  <FontAwesomeIcon icon={faFacebook} className="footer__social-icon" />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                >
                  <img src={xIcon} alt="X" className="footer__social-icon footer__x-icon" />
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__copyright">
        <p>2025 ImportFunko. Todos los derechos reservados</p>
      </div>
    </footer>
  );
};

export default Footer;