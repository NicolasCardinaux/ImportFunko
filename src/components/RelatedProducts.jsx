import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import redCircle from "../assets/red-circle-free-png.png";

const RelatedProducts = ({ productId, category }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [funkoDiscounts, setFunkoDiscounts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch de productos relacionados
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);

        if (!category || typeof category !== "string" || category.trim() === "") {
          throw new Error("Categoría inválida o no proporcionada");
        }

        const response = await fetch(
          `https://practica-django-fxpz.onrender.com/funkos?categoria=${encodeURIComponent(category)}`
        );
        if (!response.ok) {
          throw new Error(`Error al cargar productos relacionados: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Respuesta de la API para productos relacionados:", data);

        if (data && data.funkos && Array.isArray(data.funkos)) {
          const filteredProducts = data.funkos
            .filter((p) => {
              if (p.idFunko === productId) return false;
              if (!p.categoría) return false;
              if (Array.isArray(p.categoría)) {
                return p.categoría.some(
                  (cat) => (typeof cat === "object" ? cat.nombre : cat) === category
                );
              }
              return p.categoría === category;
            })
            .slice(0, 4);
          setRelatedProducts(filteredProducts);
        } else {
          throw new Error("Formato de datos inesperado en productos relacionados");
        }
      } catch (error) {
        console.error("Error al cargar productos relacionados:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchRelatedProducts();
    } else {
      setLoading(false);
      setError("No se proporcionó una categoría válida");
    }
  }, [productId, category]);

  // Fetch de funkodescuentos y descuentos
  useEffect(() => {
    fetch("https://practica-django-fxpz.onrender.com/funkodescuentos")
      .then((res) => res.json())
      .then((data) => setFunkoDiscounts(data[0] || []))
      .catch((err) => console.error("Error al cargar funkodescuentos", err));

    fetch("https://practica-django-fxpz.onrender.com/descuentos")
      .then((res) => res.json())
      .then((data) => setDiscounts(data.Descuentos || []))
      .catch((err) => console.error("Error al cargar descuentos", err));
  }, []);

  // Funciones auxiliares para manejar descuentos
  const getDiscountPercentage = (productId) => {
    const funkoDiscount = funkoDiscounts.find((d) => d.funko === productId);
    if (!funkoDiscount) return null;
    const discount = discounts.find((d) => d.idDescuento === funkoDiscount.descuento);
    return discount ? discount.porcentaje : null;
  };

  const getDiscountedPrice = (productId, originalPrice) => {
    const percentage = getDiscountPercentage(productId);
    return percentage ? (originalPrice * (1 - percentage / 100)).toFixed(2) : null;
  };

  // Handlers para navegación
  const handleViewMore = () => {
    navigate(`/?category=${encodeURIComponent(category)}`);
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  // Renderizado condicional
  if (loading) return <div>Cargando productos relacionados...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (relatedProducts.length === 0) return <div>No hay productos relacionados con esta categoría.</div>;

  return (
    <div className="related-products">
      <h3>Productos relacionados (Categoría: {category})</h3>
      <div className="related-products-list">
        {relatedProducts.map((relatedProduct) => {
          const isOutOfStock = relatedProduct.stock === 0;
          const discountPercentage = getDiscountPercentage(relatedProduct.idFunko);
          const discountedPrice = getDiscountedPrice(relatedProduct.idFunko, relatedProduct.precio);

          return (
            <div
              key={relatedProduct.idFunko}
              className={`related-product-item ${isOutOfStock ? "out-of-stock" : ""}`}
              onClick={() => !isOutOfStock && handleProductClick(relatedProduct.idFunko)}
            >
              {discountPercentage && (
                <div
                  className="discount-badge"
                  style={{ backgroundImage: `url(${redCircle})` }}
                >
                  -{discountPercentage}%
                </div>
              )}

              <img
                src={relatedProduct.imagen?.url || "https://via.placeholder.com/150"}
                alt={relatedProduct.nombre || "Funko"}
                className="related-product-image"
                onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
              />
              <h4>{relatedProduct.nombre || "Sin nombre"}</h4>

              {discountPercentage ? (
                <div className="product-item-price-container">
                  <p className="product-item-original-price">${relatedProduct.precio.toFixed(2)}</p>
                  <p className="product-item-discounted-price">${discountedPrice}</p>
                </div>
              ) : (
                <p>${relatedProduct.precio?.toFixed(2) || "0.00"}</p>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={handleViewMore} className="view-more-button">
        Ver más
      </button>
    </div>
  );
};

export default RelatedProducts;