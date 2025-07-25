import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../index.css";
import redCircle from "../assets/red-circle-free-png.png";

const ProductList = ({ filters, searchTerm, setFilteredCount, setCurrentCount, updateFilters }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [funkoDiscounts, setFunkoDiscounts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const productsPerPage = 12;
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const alternativeMessages = [
    "Funko para ti",
    "¡Perfecto para tu colección!",
    "Edición especial",
    "Único en su clase",
    "Ideal para fans",
    "Tu próximo favorito",
    "Pieza exclusiva",
    "Hecho para ti",
    "Colección estrella",
    "Funko único",
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch("https://practica-django-fxpz.onrender.com/funkos")
      .then((response) => response.json())
      .then((data) => {
        if (data.funkos && Array.isArray(data.funkos)) {
          console.log("Productos obtenidos:", data.funkos);
          setProducts(data.funkos);
        } else {
          console.error("La API no devolvió un array en la propiedad 'funkos':", data);
        }
      })
      .catch((error) => {
        console.error("Error al obtener los productos:", error);
      });
  }, []);

  useEffect(() => {
    fetch("https://practica-django-fxpz.onrender.com/funkodescuentos")
      .then((response) => response.json())
      .then((data) => {
        console.log("Datos de funkodescuentos:", data);
        setFunkoDiscounts(data[0] || []);
      })
      .catch((error) => {
        console.error("Error al cargar las relaciones Funko-Descuento:", error);
      });
  }, []);

  useEffect(() => {
    fetch("https://practica-django-fxpz.onrender.com/descuentos")
      .then((response) => response.json())
      .then((data) => {
        console.log("Datos de descuentos:", data);
        setDiscounts(data.Descuentos || []);
      })
      .catch((error) => {
        console.error("Error al cargar los descuentos:", error);
      });
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    let filtered = [...products];

    const searchParams = new URLSearchParams(location.search);
    const urlCategory = searchParams.get("category");
    console.log("Parámetro de categoría del URL:", urlCategory);
    console.log("Filtros recibidos:", filters);

    const categoryToFilter = urlCategory || filters.category;
    if (categoryToFilter) {
      filtered = filtered.filter((product) =>
        product.categoría?.some((cat) =>
          typeof cat === "object" ? cat.nombre === categoryToFilter : cat === categoryToFilter
        )
      );
    }

    if (filters.price) {
      filtered = filtered.filter((product) => product.precio <= filters.price);
    }

    if (filters.isBacklight) {
      console.log("Aplicando filtro isBacklight: true");
      filtered = filtered.filter((product) => product.is_backlight === true);
    }

    if (filters.isNotBacklight) {
      console.log("Aplicando filtro isNotBacklight: true");
      filtered = filtered.filter((product) => product.is_backlight === false);
    }

    if (filters.hasDiscount) {
      filtered = filtered.filter((product) => {
        const funkoDiscount = funkoDiscounts.find((discount) => discount.funko === product.idFunko);
        return !!funkoDiscount;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar productos: los que tienen stock > 0 primero, los que tienen stock === 0 al final
    filtered.sort((a, b) => {
      if (a.stock > 0 && b.stock === 0) return -1; // a (con stock) antes que b (sin stock)
      if (a.stock === 0 && b.stock > 0) return 1;  // b (con stock) antes que a (sin stock)
      return 0; // Mantener orden relativo si ambos tienen o no tienen stock
    });

    console.log("Productos filtrados y ordenados:", filtered);
    setFilteredProducts(filtered);
    setFilteredCount(filtered.length);
    setCurrentPage(1);
  }, [
    filters,
    products,
    searchTerm,
    funkoDiscounts,
    location.search,
    setFilteredCount,
  ]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  useEffect(() => {
    if (filteredProducts.length === 0) return;
    setCurrentCount(currentProducts.length);
  }, [currentProducts, filteredProducts, setCurrentCount]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const getPageNumbers = () => {
    const maxPageButtons = isMobile ? 2 : 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage < maxPageButtons - 1) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

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

  const getRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * alternativeMessages.length);
    return alternativeMessages[randomIndex];
  };

  console.log("Productos a renderizar:", currentProducts);

  return (
    <div>
      <div className="product-list">
        {currentProducts.length === 0 ? (
          <p className="no-products-message">No se encontraron productos</p>
        ) : (
          currentProducts.map((product, index) => {
            const discountPercentage = getDiscountPercentage(product.idFunko);
            const discountedPrice = getDiscountedPrice(product.idFunko, product.precio);
            const category = Array.isArray(product.categoría)
              ? product.categoría[0]?.nombre || getRandomMessage()
              : getRandomMessage();

            return Number(product.stock) === 0 ? (
              <div
                key={product.idFunko}
                className="product-item out-of-stock"
                style={{ "--index": index }}
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
                  src={product.imagen?.url || "https://via.placeholder.com/150"}
                  alt={product.nombre}
                />
                <h4>{product.nombre}</h4>
                {category && <p className="description">{category}</p>}
                <div className="product-item-price-container">
                  {discountPercentage ? (
                    <>
                      <p className="product-item-original-price">${product.precio.toFixed(2)}</p>
                      <p className="product-item-discounted-price">${discountedPrice}</p>
                    </>
                  ) : (
                    <p>${product.precio.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to={`/product/${product.idFunko}`}
                key={product.idFunko}
                className="product-item"
                style={{ "--index": index }}
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
                  src={product.imagen?.url || "https://via.placeholder.com/150"}
                  alt={product.nombre}
                />
                <h4>{product.nombre}</h4>
                {category && <p className="description">{category}</p>}
                <div className="product-item-price-container">
                  {discountPercentage ? (
                    <>
                      <p className="product-item-original-price">${product.precio.toFixed(2)}</p>
                      <p className="product-item-discounted-price">${discountedPrice}</p>
                    </>
                  ) : (
                    <p>${product.precio.toFixed(2)}</p>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
      <div className="pagination">
        {currentPage > 1 && (
          <button onClick={() => paginate(currentPage - 1)} className="page-btn">
            Anterior
          </button>
        )}
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => paginate(page)}
            className={`page-btn ${currentPage === page ? "active" : ""}`}
          >
            {page}
          </button>
        ))}
        {currentPage < totalPages && (
          <button onClick={() => paginate(currentPage + 1)} className="page-btn">
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductList;