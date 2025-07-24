import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import "../css/style.css";
import logo from "../assets/logo.png";
import { FaUser, FaSearch, FaShoppingCart } from "react-icons/fa";
import ThemeToggleButton from "./ThemeToggleButton";
import { useAuth } from "../context/AuthContext";

const Header = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  useEffect(() => {
    let timeoutId;

    if (menuOpen) {
      timeoutId = setTimeout(() => {
        setMenuOpen(false);
      }, 4000);
    }

    return () => clearTimeout(timeoutId);
  }, [menuOpen]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSearchClick = () => {
    if (searchTerm.trim() !== "") {
      navigate(`/?search=${searchTerm}`);
    }
  };

  const redirectToHome = () => {
    navigate("/");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header__logo" onClick={redirectToHome} style={{ cursor: "pointer" }}>
        <img src={logo} alt="Logo ImportFunko" className="header__logo-img" />
        <h1 className="header__title">ImportFunko</h1>
      </div>

      <div className="header__center">
        <div className="header__search">
          <input
            type="text"
            placeholder="Buscar"
            className="header__search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="header__search-button" onClick={handleSearchClick}>
            <FaSearch />
          </button>
        </div>
        <ThemeToggleButton /> {}
        {isAuthenticated && user?.isStaff && (
          <button className="btn-admin-panel" onClick={() => navigate("/admin")}>
            Panel Admin
          </button>
        )}
      </div>

      <div className="header__icons">
        {isAuthenticated ? (
          <>
            <FaShoppingCart className="header__icon" onClick={() => navigate("/cart")} /> {}
            <div className="header__user-icon" onClick={toggleMenu}>
              <FaUser /> {}
            </div>
            {menuOpen && (
              <div className="header__dropdown">
                <ul>
                  <li onClick={redirectToHome}>Tienda</li>
                  <li onClick={() => navigate("/cart")}>Carrito</li>
                  <li onClick={() => navigate("/favoritos")}>Favoritos</li>
                  <li onClick={() => navigate("/my-purchases")}>Mis Compras</li>
                  <li onClick={() => navigate("/mis-datos")}>Mis Datos</li>
                  <li onClick={handleLogout}>Cerrar Sesión</li>
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            <button className="header__login-btn" onClick={() => navigate("/login")}>
              Iniciar Sesión
            </button>
            <button className="header__register-btn" onClick={() => navigate("/register")}>
              Registrarse
            </button>
          </>
        )}
      </div>

      <div className="header__lightsaber-line"></div>
    </header>
  );
};

export default Header;