import React from 'react';
import { useLocation } from 'react-router-dom';
import bannerImage from '../assets/banner.jpg';
import '../index.css';

function Banner() {
  const location = useLocation();

  const getBannerText = () => {
    switch (location.pathname) {
      case '/':
        return { main: 'Tienda', breadcrumb: 'Inicio > Tienda' };
      case '/cart':
        return { main: 'Carrito', breadcrumb: 'Inicio > Carrito' };
      case '/my-purchases':
        return { main: 'Mis Compras', breadcrumb: 'Inicio > Mis Compras' };
      case '/favoritos':
        return { main: 'Favoritos', breadcrumb: 'Inicio > Favoritos' };
      case '/checkout':
        return { main: 'Checkout', breadcrumb: 'Inicio > Checkout' };
      case '/mis-datos':
        return { main: 'Mis Datos', breadcrumb: 'Inicio > Mis Datos' };
      case '/quienes-somos':
        return { main: '¿Quiénes Somos?', breadcrumb: 'Inicio > ¿Quiénes Somos?' };
      default:
        return { main: 'Tienda', breadcrumb: 'Inicio > Tienda' }; 
    }
  };

  const { main, breadcrumb } = getBannerText();

  return (
    <div className="banner">
      <div className="dynamic-title">
        <h1 className="dynamic-title__main">{main}</h1>
        <p className="dynamic-title__breadcrumbs">{breadcrumb}</p>
      </div>
      <img
        src={bannerImage}
        alt="Banner de ecommerce"
        className="banner__image"
      />
      <div className="banner__overlay"></div>
    </div>
  );
}

export default Banner;