import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import RelatedProducts from "./RelatedProducts";
import Reviews from "./Reviews";
import ShippingCalculator from "./ShippingCalculator";
import '../index.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [funkoDiscounts, setFunkoDiscounts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [discountedPrice, setDiscountedPrice] = useState(null);

  const reviewsSectionRef = useRef(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Redirección al home si el producto tiene stock 0
  useEffect(() => {
    if (product && product.stock === 0) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [product, navigate]);

  // Fetch del producto
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log(`[Funko Fetch] Haciendo solicitud a: https://practica-django-fxpz.onrender.com/funkos/${id}`);
        const response = await fetch(`https://practica-django-fxpz.onrender.com/funkos/${id}`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Error al cargar el Funko: ${response.status} - ${text}`);
        }
        const data = await response.json();
        console.log("[Funko Fetch] Datos del Funko:", data);
        if (data && data.Funko) {
          setProduct(data.Funko);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("[Funko Fetch] Error al cargar el Funko:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch de relaciones Funko-Descuento
  useEffect(() => {
    const fetchFunkoDiscounts = async () => {
      try {
        console.log("[Discounts] Haciendo solicitud a: https://practica-django-fxpz.onrender.com/funkodescuentos");
        const response = await fetch("https://practica-django-fxpz.onrender.com/funkodescuentos");
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Error al cargar las relaciones Funko-Descuento: ${response.status} - ${text}`);
        }
        const data = await response.json();
        console.log("[Discounts] Datos de funkodescuentos:", data);
        setFunkoDiscounts(data[0] || []);
      } catch (error) {
        console.error("[Discounts] Error al cargar las relaciones Funko-Descuento:", error);
        setFunkoDiscounts([]);
      }
    };

    fetchFunkoDiscounts();
  }, []);

  // Fetch de descuentos
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        console.log("Haciendo solicitud a: https://practica-django-fxpz.onrender.com/descuentos");
        const response = await fetch("https://practica-django-fxpz.onrender.com/descuentos");
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Error al cargar los descuentos: ${response.status} - ${text}`);
        }
        const data = await response.json();
        console.log("Datos de descuentos:", data);
        setDiscounts(data.Descuentos || []);
      } catch (error) {
        console.error("Error al cargar los descuentos:", error);
        setDiscounts([]);
      }
    };

    fetchDiscounts();
  }, []);

  // Calcular precio con descuento
  useEffect(() => {
    if (product && funkoDiscounts.length > 0 && discounts.length > 0) {
      const productId = parseInt(id, 10);
      const funkoDiscount = funkoDiscounts.find((discount) => discount.funko === productId);
      if (!funkoDiscount) {
        setDiscountedPrice(null);
        return;
      }

      const discountId = funkoDiscount.descuento;
      const discountData = discounts.find((discount) => discount.idDescuento === discountId);
      if (discountData) {
        const discountPercentage = discountData.porcentaje / 100;
        const originalPrice = product.precio || 0;
        const discountAmount = originalPrice * discountPercentage;
        const newPrice = originalPrice - discountAmount;
        setDiscountedPrice(newPrice);
      } else {
        setDiscountedPrice(null);
      }
    }
  }, [product, funkoDiscounts, discounts, id]);

  useEffect(() => {
    const checkIfFavorite = async () => {
      if (!token) return;

      try {
        console.log("[Favorites] Verificando si el Funko está en favoritos...");
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
          console.log("[Favorites] Respuesta del servidor (favoritos):", text);
          throw new Error(`Error al verificar favoritos: ${response.status} - ${text}`);
        }

        const data = await response.json();
        console.log("[Favorites] Favoritos obtenidos (checkIfFavorite):", data);
        const favorites = data.funkos || [];
        const isFav = favorites.some((item) => item.idFunko === parseInt(id));
        setIsFavorite(isFav);
      } catch (err) {
        console.error("[Favorites] Error al verificar favoritos:", err);
        setIsFavorite(false);
      }
    };

    checkIfFavorite();
  }, [id, token]);

  // Fetch de reseñas
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log(`[Reviews] Haciendo solicitud a: https://practica-django-fxpz.onrender.com/reseñas?funko=${id}`);
        const response = await fetch(`https://practica-django-fxpz.onrender.com/reseñas?funko=${id}`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Error al cargar las reseñas: ${response.status} - ${text}`);
        }
        const data = await response.json();
        console.log("[Reviews] Datos de las reseñas:", data);

        const filteredReviews = data.filter((review) => review.funko === parseInt(id));
        console.log("[Reviews] Reseñas filtradas:", filteredReviews);

        const uniqueReviews = Array.from(
          new Map(filteredReviews.map((review) => [review.idReseña, review])).values()
        );
        console.log("[Reviews] Reseñas únicas:", uniqueReviews);
        setReviews(uniqueReviews);

        if (uniqueReviews.length > 0) {
          const totalStars = uniqueReviews.reduce((sum, review) => sum + (review.estrellas || 0), 0);
          const avg = totalStars / uniqueReviews.length;
          setAverageRating(Math.round(avg));
        } else {
          setAverageRating(0);
        }
      } catch (error) {
        console.error("[Reviews] Error al cargar las reseñas:", error);
        setReviews([]);
        setAverageRating(0);
      }
    };

    fetchReviews();
  }, [id]);

  const handleAddToCart = async () => {
    if (!token) {
      const currentPath = location.pathname;
      sessionStorage.setItem("redirectAfterLogin", currentPath);
      navigate("/login");
      return;
    }

    if (!userId) {
      return;
    }

    if (quantity <= 0) {
      return;
    }

    const funkoId = parseInt(id, 10);
    const cantidad = parseInt(quantity, 10);

    if (isNaN(funkoId)) {
      return;
    }

    try {
      console.log("[Cart] Haciendo solicitud a: https://practica-django-fxpz.onrender.com/carritos");
      const payload = {
        idFunko: funkoId,
        cantidad: cantidad,
        userId: parseInt(userId, 10),
      };
      console.log("[Cart] Datos enviados al servidor:", payload);
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
        console.log("[Cart] Respuesta del servidor (carrito):", text);
        throw new Error(`Error ${response.status}: ${text}`);
      }

      const responseData = await response.json();
      console.log("[Cart] Respuesta del servidor (éxito):", responseData);
      navigate("/cart");
    } catch (err) {
      console.error("[Cart] Error al agregar al carrito:", err);
    }
  };

  const toggleFavorite = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    const funkoId = parseInt(id, 10);
    if (isNaN(funkoId)) {
      return;
    }

    try {
      if (isFavorite) {
        console.log(`[Favorites] Eliminando Funko ${funkoId} de favoritos...`);
        const response = await fetch(`https://practica-django-fxpz.onrender.com/funkos/${funkoId}/favoritos`, {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.log("[Favorites] Respuesta del servidor (eliminar favorito):", text);
          throw new Error(`Error al eliminar de favoritos: ${response.status} - ${text}`);
        }

        setIsFavorite(false);
      } else {
        console.log(`[Favorites] Agregando Funko ${funkoId} a favoritos...`);
        const response = await fetch(`https://practica-django-fxpz.onrender.com/funkos/${funkoId}/favoritos`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.log("[Favorites] Respuesta del servidor (agregar favorito):", text);
          throw new Error(`Error al agregar a favoritos: ${response.status} - ${text}`);
        }

        setIsFavorite(true);
      }
    } catch (err) {
      console.error("[Favorites] Error al gestionar favoritos:", err);
    }
  };

  const renderStars = (rating, hasReviews) => {
    if (!hasReviews) {
      return null;
    }

    const fullStars = Math.floor(rating);
    const partialStarPercentage = (rating % 1) * 100;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="product-rating">
        {Array(fullStars)
          .fill()
          .map((_, index) => (
            <span key={`full-${index}`} className="star full">
              ★
            </span>
          ))}
        {partialStarPercentage > 0 && (
          <span
            className="star partial"
            style={{
              background: `linear-gradient(90deg, #ffcc00 ${partialStarPercentage}%, #e0e0e0 ${partialStarPercentage}%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ★
          </span>
        )}
        {Array(emptyStars)
          .fill()
          .map((_, index) => (
            <span key={`empty-${index}`} className="star empty">
              ☆
            </span>
          ))}
      </div>
    );
  };

  const scrollToReviews = () => {
    if (reviewsSectionRef.current) {
      reviewsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!product) return null;

  const precio = product.precio || 0;
  const isRetroiluminado = product.is_backlight || false;
  const categoryNames = Array.isArray(product.categoría)
    ? product.categoría.map((cat) => (typeof cat === "object" ? cat.nombre : cat)).join(", ")
    : null;
  const category = Array.isArray(product.categoría)
    ? product.categoría[0]?.nombre || product.categoría[0]
    : null;

  return (
    <div>
      <Breadcrumb productTitle={product.nombre || "Funko"} />
      <div className="product-detail">
        <div className="product-detail-content">
          <div className="product-detail-image">
            <img
              src={product.imagen?.url || "https://via.placeholder.com/150"}
              alt={product.nombre || "Funko"}
              onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
            />
          </div>
          <div className="product-detail-info">
            <h2>{product.nombre || "Sin nombre"}</h2>
            <p className="product-price">
              {discountedPrice !== null ? (
                <>
                  <span className="original-price">${precio.toFixed(2)}</span>
                  <span className="discounted-price">${discountedPrice.toFixed(2)}</span>
                </>
              ) : (
                <span className="current-price">${precio.toFixed(2)}</span>
              )}
            </p>
            {reviews.length > 0 && (
              <div
                className="product-rating-container"
                onClick={scrollToReviews}
                style={{ cursor: "pointer" }}
                title="Ver reseñas"
              >
                {renderStars(averageRating, true)}
              </div>
            )}
            <p className="retroiluminado">
              Es Retroiluminado: <span className="checkbox-box">{isRetroiluminado ? "✔" : "✘"}</span>
            </p>
            <hr className="retroiluminado-line" />
            {(() => {
              const frases = [
                "Brilla en tu colección",
                "Edición para fanáticos",
                "Perfecto para exhibir",
                "Un must coleccionable",
                "Tu héroe favorito",
                "Añádelo a tu vitrina",
                "Colección que inspira",
                "Exclusivo y especial",
                "Último disponible",
                "Un clásico eterno"
              ];
              const index = parseInt(id, 10) % frases.length;
              const fraseFija = frases[index];
              return <p className="product-frase">{fraseFija}</p>;
            })()}
            {categoryNames && <p className="product-category">Categoría: {categoryNames}</p>}
            {product.stock === 0 && (
              <div className="out-of-stock-warning">
                Este producto no tiene stock. Serás redirigido al inicio en 5 segundos.
              </div>
            )}
            <div className="shipping-section-wrapper">
              <ShippingCalculator quantity={quantity} />
            </div>
            <div className="product-quantity-container">
              <div className="product-quantity">
                <button
                  onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                  aria-label="Disminuir cantidad"
                  disabled={product.stock === 0}
                >
                  -
                </button>
                <input type="text" value={quantity} readOnly aria-label="Cantidad de productos" />
                <button
                  onClick={() =>
                    setQuantity(quantity < (product.stock || 0) ? quantity + 1 : product.stock || 0)
                  }
                  aria-label="Aumentar cantidad"
                  disabled={product.stock === 0}
                >
                  +
                </button>
              </div>
              <button
                className="add-to-cart-button"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                aria-label="Agregar al carrito"
              >
                {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
              </button>
            </div>
            <div
              className={`favorite-icon ${isFavorite ? "filled" : ""}`}
              onClick={product.stock === 0 ? null : toggleFavorite}
              role="button"
              tabIndex="0"
              aria-label={isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
              style={{
                cursor: product.stock === 0 ? "not-allowed" : "pointer",
                opacity: product.stock === 0 ? 0.6 : 1,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="35"
                height="35"
                fill={isFavorite ? "#ff6666" : "none"}
                stroke={isFavorite ? "none" : "#333333"}
                strokeWidth="2"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
        </div>
        <hr className="full-width-line" />
        <div className="description-container">
          <h3 className="description-title">Descripción:</h3>
          <div className="product-description">
            <p>{product.descripción || ""}</p>
          </div>
        </div>
        {reviews.length > 0 && (
          <div ref={reviewsSectionRef}>
            <Reviews funkoId={id} />
          </div>
        )}
        {category && <RelatedProducts productId={product.idFunko || id} category={category} />}
      </div>
    </div>
  );
};

export default ProductDetail;