import React, { useEffect, useState, useRef } from "react";
import "../index.css";

const Reviews = ({ funkoId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const reviewsContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        console.log(`Haciendo solicitud a: https://practica-django-fxpz.onrender.com/reseñas?funko=${funkoId}`);
        const token = localStorage.getItem("token");
        const response = await fetch(`https://practica-django-fxpz.onrender.com/reseñas?funko=${funkoId}`, {
          headers: {
            Authorization: token ? `Token ${token}` : "",
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          const text = await response.text();
          console.log("Respuesta del servidor (reseñas):", text);
          throw new Error(`Error al cargar las reseñas: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Reseñas obtenidas:", data);

        const filteredReviews = data.filter((review) => review.funko === parseInt(funkoId));
        const uniqueReviews = Array.from(
          new Map(filteredReviews.map((review) => [review.idReseña, review])).values()
        );
        setReviews(uniqueReviews);
      } catch (error) {
        console.error("Error al cargar las reseñas:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [funkoId]);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    return (
      <div className="review-stars">
        {Array(fullStars)
          .fill()
          .map((_, index) => (
            <span key={`full-${index}`} className="star full">★</span>
          ))}
        {Array(emptyStars)
          .fill()
          .map((_, index) => (
            <span key={`empty-${index}`} className="star empty">☆</span>
          ))}
      </div>
    );
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  };

  const handleNext = () => {
    if (currentIndex < reviews.length - 1) {
      setCurrentIndex(currentIndex + 1);
      if (!isMobile) {
        const reviewWidth = reviewsContainerRef.current.querySelector(".review-item").offsetWidth + 20;
        reviewsContainerRef.current.scrollBy({
          left: reviewWidth,
          behavior: "smooth",
        });
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      if (!isMobile) {
        const reviewWidth = reviewsContainerRef.current.querySelector(".review-item").offsetWidth + 20;
        reviewsContainerRef.current.scrollBy({
          left: -reviewWidth,
          behavior: "smooth",
        });
      }
    }
  };

  if (loading) return <div className="loading-message">Cargando reseñas...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (reviews.length === 0) return <div className="no-reviews-message">No hay reseñas disponibles para este Funko.</div>;

  return (
    <div className="reviews-container">
      <h3>Reseñas</h3>
      <div className="reviews-wrapper">
        {reviews.length > 1 && (
          <button
            className="nav-arrow left-arrow"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            &lt;
          </button>
        )}
        
        {isMobile ? (
          <div className="reviews-list">
            <div key={reviews[currentIndex].idReseña} className="review-item">
              <div className="review-header">
                <span className="review-date">{formatDate(reviews[currentIndex].fecha)}</span>
              </div>
              {renderStars(reviews[currentIndex].estrellas)}
              <p className="review-content">{reviews[currentIndex].contenido}</p>
              <p className="review-user">{reviews[currentIndex].nombre_usuario || "Desconocido"}</p>
            </div>
          </div>
        ) : (
          <div className="reviews-list" ref={reviewsContainerRef}>
            {reviews.map((review) => (
              <div key={review.idReseña} className="review-item">
                <div className="review-header">
                  <span className="review-date">{formatDate(review.fecha)}</span>
                </div>
                {renderStars(review.estrellas)}
                <p className="review-content">{review.contenido}</p>
                <p className="review-user">{review.nombre_usuario || "Desconocido"}</p>
              </div>
            ))}
          </div>
        )}
        
        {reviews.length > 1 && (
          <button
            className="nav-arrow right-arrow"
            onClick={handleNext}
            disabled={isMobile ? currentIndex >= reviews.length - 1 : currentIndex >= reviews.length - 2}
          >
            &gt;
          </button>
        )}
      </div>
    </div>
  );
};

export default Reviews;