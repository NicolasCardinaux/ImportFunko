import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import redCircle from "../assets/red-circle-free-png.png";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [funkoDetails, setFunkoDetails] = useState({});
  const [funkoDiscounts, setFunkoDiscounts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) {
        setError("Debes iniciar sesión para ver tus favoritos.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const endpoint = "https://practica-django-fxpz.onrender.com/usuarios/favoritos";
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Error al cargar los favoritos: ${response.status} - ${text}`);
        }

        const data = await response.json();
        setFavorites(data.funkos || []);

        // Obtener detalles de los funkos incluyendo stock
        const funkosResponse = await fetch("https://practica-django-fxpz.onrender.com/funkos", {
          headers: { Authorization: `Token ${token}` },
        });
        if (!funkosResponse.ok) {
          throw new Error("Error al obtener detalles de los funkos");
        }
        const funkosData = await funkosResponse.json();
        const detailsMap = funkosData.funkos.reduce((acc, funko) => {
          acc[funko.idFunko] = funko;
          return acc;
        }, {});
        setFunkoDetails(detailsMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchFunkoDiscounts = async () => {
      try {
        const response = await fetch("https://practica-django-fxpz.onrender.com/funkodescuentos");
        const data = await response.json();
        setFunkoDiscounts(data[0] || []);
      } catch (error) {
        console.error("Error al cargar las relaciones Funko-Descuento:", error);
      }
    };

    const fetchDiscounts = async () => {
      try {
        const response = await fetch("https://practica-django-fxpz.onrender.com/descuentos");
        const data = await response.json();
        setDiscounts(data.Descuentos || []);
      } catch (error) {
        console.error("Error al cargar los descuentos:", error);
      }
    };

    fetchFavorites();
    fetchFunkoDiscounts();
    fetchDiscounts();
  }, [token]);

  const removeFromFavorites = async (funkoId) => {
    if (!token) {
      setError("Debes iniciar sesión para eliminar de favoritos.");
      return;
    }

    try {
      const response = await fetch(`https://practica-django-fxpz.onrender.com/funkos/${funkoId}/favoritos`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al eliminar de favoritos: ${response.status} - ${text}`);
      }

      setFavorites(favorites.filter((item) => item.idFunko !== funkoId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddToCart = async (funkoId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!userId) {
      return;
    }

    try {
      const payload = {
        idFunko: funkoId,
        cantidad: 1,
        userId: parseInt(userId, 10),
      };
      const response = await fetch("https://practica-django-fxpz.onrender.com/carritos", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error ${response.status}: ${text}`);
      }
    } catch (err) {
    }
  };

  const handleFunkoClick = (funkoId) => {
    navigate(`/product/${funkoId}`);
  };

  const getDiscountPercentage = (productId) => {
    const funkoDiscount = funkoDiscounts.find((discount) => discount.funko === productId);
    if (!funkoDiscount) return null;

    const discountId = funkoDiscount.descuento;
    const discountData = discounts.find((discount) => discount.idDescuento === discountId);
    return discountData ? discountData.porcentaje : null;
  };

  const getDiscountedPrice = (productId, originalPrice) => {
    const discountPercentage = getDiscountPercentage(productId);
    if (!discountPercentage) return null;
    return (originalPrice * (1 - discountPercentage / 100)).toFixed(2);
  };

  if (loading) return <div className="loading-message">Cargando favoritos...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (favorites.length === 0) return <div className="no-favorites-message">No tienes Funkos en tus favoritos.</div>;

  return (
    <div className="favorites-container">
      <h2 className="favorites-title">Tus Funkos Favoritos</h2>
      <div className="favorites-grid">
        {favorites.map((item, index) => {
          const funkoDetail = funkoDetails[item.idFunko];
          if (!funkoDetail) return null; // Espera a que los detalles estén disponibles

          const discountPercentage = getDiscountPercentage(item.idFunko);
          const discountedPrice = getDiscountedPrice(item.idFunko, item.precio);
          const isOutOfStock = funkoDetail.stock === 0;

          return (
            <div key={item.idFunko} className="favorite-item" style={{ '--index': index }}>
              {discountPercentage && (
                <div
                  className="favorite-discount-badge"
                  style={{ backgroundImage: `url(${redCircle})` }}
                >
                  -{discountPercentage}%
                </div>
              )}

              {isOutOfStock && (
                <div className="favorite-out-of-stock-overlay">
                  <p className="out-of-stock-text">Producto agotado</p>
                </div>
              )}

              <img
                src={item.imagen?.url || "https://via.placeholder.com/150"}
                alt={item.nombre}
                className="favorite-item-image"
                onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                onClick={() => {
                  if (!isOutOfStock) handleFunkoClick(item.idFunko);
                }}
                style={{ cursor: isOutOfStock ? "default" : "pointer" }}
              />
              <div className="favorite-item-info">
                <h3
                  className="favorite-item-name"
                  onClick={() => {
                    if (!isOutOfStock) handleFunkoClick(item.idFunko);
                  }}
                  style={{ cursor: isOutOfStock ? "default" : "pointer" }}
                >
                  {item.nombre || "Nombre producto"}
                </h3>
                <div className="favorite-item-price-container">
                  {discountPercentage ? (
                    <>
                      <p className="favorite-item-original-price">${item.precio?.toFixed(2) || "0.00"}</p>
                      <p className="favorite-item-discounted-price">${discountedPrice}</p>
                    </>
                  ) : (
                    <p className="favorite-item-price">${item.precio?.toFixed(2) || "0.00"}</p>
                  )}
                </div>
                <div className="favorite-item-actions">
                  {!isOutOfStock && (
                    <button
                      className="favorite-add-to-cart-button"
                      onClick={() => handleAddToCart(item.idFunko)}
                    >
                      Agregar al carrito
                    </button>
                  )}
                  <button
                    className="favorite-remove-button"
                    onClick={() => removeFromFavorites(item.idFunko)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FavoritesPage;