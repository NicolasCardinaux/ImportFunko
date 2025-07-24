import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReactStars from "react-rating-stars-component";
import "../index.css";
import { FaStar, FaTruck } from "react-icons/fa";

const API_BASE = "https://practica-django-fxpz.onrender.com";

const MyPurchases = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [expandedPurchaseId, setExpandedPurchaseId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({});
  const [showReviewForm, setShowReviewForm] = useState({});
  const [funkoImages, setFunkoImages] = useState({});

  useEffect(() => {
    if (!isAuthenticated || !localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    const fetchPurchases = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/usuarios/${user.userId}/compras`, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await res.json();
        data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        setPurchases(data);

        const images = {};
        for (const purchase of data) {
          for (const item of purchase.items) {
            const funkoId = item.funko.idFunko;
            const imageRes = await fetch(`${API_BASE}/funkos/${funkoId}`, {
              headers: { Authorization: `Token ${token}` },
            });
            const funkoData = await imageRes.json();
            if (funkoData.Funko?.imagen?.url) {
              images[funkoId] = funkoData.Funko.imagen.url;
            }
          }
        }
        setFunkoImages(images);
      } catch (err) {
        console.error("Error al cargar compras o imágenes:", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/reseñas`, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await res.json();
        setReviews(data.filter((r) => r.usuario === parseInt(user.userId)));
      } catch (err) {
        console.error("Error al cargar reseñas:", err);
      }
    };

    fetchPurchases();
    fetchReviews();
  }, [isAuthenticated, navigate, user]);

  const traducirEstado = (estado) => {
    switch (estado) {
      case "PENDIENTE": return "Pendiente";
      case "EN_PROCESO": return "En proceso";
      case "ENVIADO": return "Enviado";
      case "ENTREGADO": return "Entregado";
      default: return estado;
    }
  };

  const toggleDetails = (event, id) => {
    const targetClass = event.target.className;
    if (
      typeof targetClass === 'string' &&
      !targetClass.includes('item-image') &&
      !targetClass.includes('item-info') &&
      !targetClass.includes('review-container') &&
      !targetClass.includes('review-form') &&
      !targetClass.includes('review-list') &&
      !targetClass.includes('review-textarea') &&
      !targetClass.includes('star-rating') &&
      !targetClass.includes('submit-review-button') &&
      expandedPurchaseId === id
    ) {
      setExpandedPurchaseId(null);
    } else if (
      typeof targetClass === 'string' &&
      !targetClass.includes('item-image') &&
      !targetClass.includes('item-info') &&
      !targetClass.includes('review-container') &&
      !targetClass.includes('review-form') &&
      !targetClass.includes('review-list') &&
      !targetClass.includes('review-textarea') &&
      !targetClass.includes('star-rating') &&
      !targetClass.includes('submit-review-button')
    ) {
      setExpandedPurchaseId(id);
    }
  };

  const handleFunkoClick = (funkoId) => {
    navigate(`/product/${funkoId}`);
  };

  const toggleReviewForm = (funkoId) => {
    setShowReviewForm((prev) => ({
      ...prev,
      [funkoId]: !prev[funkoId],
    }));
  };

  const handleReviewChange = (funkoId, field, value) => {
    setNewReview((prev) => ({
      ...prev,
      [funkoId]: {
        ...(prev[funkoId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSubmitReview = async (funkoId) => {
    const token = localStorage.getItem("token");
    const userId = user?.userId || localStorage.getItem("userId");

    if (!token || !userId || !funkoId || !newReview[funkoId]?.estrellas || !newReview[funkoId]?.contenido) {
      alert("Faltan datos para enviar la reseña. Asegúrate de completar todos los campos.");
      return;
    }

    if (newReview[funkoId].contenido.length > 300) {
      alert("La reseña no puede exceder los 300 caracteres.");
      return;
    }

    const reviewData = {
      contenido: newReview[funkoId].contenido,
      estrellas: parseInt(newReview[funkoId].estrellas),
      usuario: parseInt(userId),
      funko: parseInt(funkoId),
    };

    try {
      const response = await fetch(`${API_BASE}/reseñas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error del servidor:", errorText);
        alert(`Error al enviar la reseña: ${errorText}`);
        return;
      }

      const newRes = await response.json();
      setReviews((prev) => [...prev, newRes]);
      setNewReview((prev) => ({ ...prev, [funkoId]: {} }));
      toggleReviewForm(funkoId);
      alert("¡Reseña enviada con éxito!");
    } catch (err) {
      console.error("Error al enviar reseña:", err);
      alert("Ocurrió un error inesperado.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/reseñas/${reviewId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ Error al eliminar reseña (ID: ${reviewId}): ${res.status} - ${errorText}`);
        alert(`Error al eliminar la reseña: ${res.status} - ${errorText}`);
        return;
      }

      setReviews((prev) => prev.filter((r) => r.idReseña !== reviewId));
      alert("Reseña eliminada con éxito.");
    } catch (err) {
      console.error("⚠️ Error inesperado al eliminar reseña:", err);
      alert("Ocurrió un error inesperado al intentar eliminar la reseña.");
    }
  };

  const getStatusProgress = (estado) => {
    switch (estado) {
      case "PENDIENTE": return 25;
      case "EN_PROCESO": return 50;
      case "ENVIADO": return 75;
      case "ENTREGADO": return 100;
      default: return 0;
    }
  };

  return (
    <div className="my-purchases-container">
      <h2>Revisa y califica tus compras</h2>
      <div className="purchases-wrapper">
        <div className="purchases-list">
          {purchases.length === 0 ? (
            <p className="no-purchases-message">
              Aún no has realizado ninguna compra.
            </p>
          ) : (
            purchases.map((purchase, index) => (
              <div
                key={purchase.idCompra}
                className={`purchase-item ${
                  expandedPurchaseId === purchase.idCompra ? "selected" : ""
                }`}
                onClick={(e) => toggleDetails(e, purchase.idCompra)}
              >
                <p className="purchase-title">Compra #{index + 1}</p>
                <p><strong>Fecha:</strong> {new Date(purchase.fecha).toLocaleDateString()}</p>
                <p><strong>Total:</strong> ${purchase.total}</p>
                <p><strong>Estado:</strong> {traducirEstado(purchase.estado)}</p>

                {expandedPurchaseId === purchase.idCompra && (
                  <div className="purchase-details">
                    <h3>Detalles de la Compra</h3>
                    <p><strong>Subtotal:</strong> ${purchase.subtotal}</p>
                    <p>
                      <strong>Dirección:</strong>{" "}
                      {purchase.direccion
                        ? `${purchase.direccion.calle} ${purchase.direccion.numero}`
                        : "No disponible"}
                    </p>

                    <h4>Productos</h4>
                    <hr className="first-separator" />
                    <ul className="items-list">
                      {purchase.items.map((item, itemIndex) => {
                        const userReview = reviews.find(
                          (r) => r.funko === item.funko.idFunko
                        );
                        const funkoImage = funkoImages[item.funko.idFunko];

                        return (
                          <li key={item.idCompraItem} className="item">
                            <div className="item-content">
                              {funkoImage && (
                                <img
                                  src={funkoImage}
                                  alt={item.funko.nombre}
                                  className="item-image"
                                  onClick={() => handleFunkoClick(item.funko.idFunko)}
                                  style={{ cursor: 'pointer' }}
                                />
                              )}
                              <div className="item-info">
                                <p>
                                  <strong
                                    onClick={() => handleFunkoClick(item.funko.idFunko)}
                                    style={{ cursor: 'pointer', color: '#4A90E2' }}
                                  >
                                    {item.funko.nombre}
                                  </strong>
                                </p>
                                <p>{item.funko.descripción}</p>
                                <p className="item-quantity">Cantidad: {item.cantidad}</p>
                                <p className="item-subtotal">Subtotal: ${item.subtotal}</p>
                              </div>
                            </div>

                            {purchase.estado === "ENTREGADO" && (
                              <div className="review-actions">
                                <button
                                  className="review-toggle-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleReviewForm(item.funko.idFunko);
                                  }}
                                  title="Escribir o ver reseña"
                                >
                                  <FaStar />
                                </button>

                                {showReviewForm[item.funko.idFunko] && (
                                  <div className="review-container" onClick={(e) => e.stopPropagation()}>
                                    {!userReview && (
                                      <div className="review-form">
                                        <textarea
                                          placeholder="Escribí tu reseña (máx. 300 caracteres)"
                                          value={newReview[item.funko.idFunko]?.contenido || ""}
                                          onClick={(e) => e.stopPropagation()}
                                          onChange={(e) =>
                                            handleReviewChange(item.funko.idFunko, "contenido", e.target.value)
                                          }
                                          className="review-textarea"
                                          maxLength={300}
                                        />
                                        <p className="char-counter">
                                          {newReview[item.funko.idFunko]?.contenido?.length || 0}/300 
                                        </p>
                                        <div className="star-rating" onClick={(e) => e.stopPropagation()}>
                                          <ReactStars
                                            count={5}
                                            value={newReview[item.funko.idFunko]?.estrellas || 0}
                                            onChange={(newValue) =>
                                              handleReviewChange(item.funko.idFunko, "estrellas", newValue)
                                            }
                                            size={30}
                                            activeColor="#ffc107"
                                          />
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSubmitReview(item.funko.idFunko);
                                          }}
                                          className="submit-review-button"
                                        >
                                          Enviar Reseña
                                        </button>
                                      </div>
                                    )}

                                    {userReview && (
                                      <div className="review-list" onClick={(e) => e.stopPropagation()}>
                                        <p><strong>Tu reseña:</strong></p>
                                        <p>{userReview.contenido}</p>
                                        <p><strong>Tus estrellas:</strong> <span className="star">⭐</span>{userReview.estrellas}</p>
                                        <div className="review-buttons">
                                          <button
                                            className="delete-btn"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteReview(userReview.idReseña);
                                            }}
                                          >
                                            Eliminar
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    <hr className="last-separator" />
                    <div className="status-bar-container">
                      <h4>Estado del Pedido</h4>
                      <div className="status-bar">
                        <div
                          className="status-progress"
                          style={{ width: `${getStatusProgress(purchase.estado)}%` }}
                        >
                          <FaTruck
                            className="truck-icon"
                            style={{
                              position: 'absolute',
                              right: '-15px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              fontSize: '1.2rem',
                              color: '#2E2E2E',
                            }}
                          />
                        </div>
                      </div>
                      <div className="status-labels">
                        <span>Pendiente</span>
                        <span>En proceso</span>
                        <span>Enviado</span>
                        <span>Entregado</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPurchases;