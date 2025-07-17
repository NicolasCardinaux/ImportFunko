import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ productTitle }) => {
  return (
    <div className="breadcrumb-container">
      <Link to="/" className="breadcrumb-link">
        Inicio
      </Link>
      <span className="breadcrumb-separator"> &gt; </span>
      
      {/* Línea separadora */}
      <div className="separator-line"></div>

      <span className="breadcrumb-current">{productTitle || "Producto desconocido"}</span>
    </div>
  );
};

export default Breadcrumb;
