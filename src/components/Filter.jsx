import React, { useState, useEffect } from "react";

const Filter = ({ onFilterChange, currentCount, totalFilteredCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isBacklight, setIsBacklight] = useState(false); 
  const [isNotBacklight, setIsNotBacklight] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false); 
  const [categories, setCategories] = useState([]); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://practica-django-fxpz.onrender.com/categorias");
        if (!response.ok) {
          throw new Error("Error al obtener las categorías");
        }
        const data = await response.json();

        if (data && data.Categorias) {
          setCategories(data.Categorias.map((cat) => cat.nombre));
        } else {
          throw new Error("Formato de datos inesperado");
        }
      } catch (err) {
        console.error("Error al cargar las categorías:", err);
        setError("No se pudieron cargar las categorías. Por favor, intenta de nuevo.");
      }
    };

    fetchCategories();
  }, []); 


  const handleBacklightChange = (e) => {
    const checked = e.target.checked;
    setIsBacklight(checked);
    if (checked) {
      setIsNotBacklight(false); 
    }
  };


  const handleNotBacklightChange = (e) => {
    const checked = e.target.checked;
    setIsNotBacklight(checked);
    if (checked) {
      setIsBacklight(false); 
    }
  };

  const handleApply = () => {
    onFilterChange({
      category: selectedCategory,
      price: maxPrice,
      isBacklight: isBacklight,
      isNotBacklight: isNotBacklight, 
      hasDiscount: hasDiscount,
    });
    setIsOpen(false);
  };

  return (
    <>
      <div className={`filter-container ${isOpen ? "open" : ""}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="filter-toggle-button"
        >
          Filtrar <span className="arrow">{isOpen ? "▲" : "▼"}</span>
        </button>

        <div className="filter-result-count">
          Mostrando {currentCount} de {totalFilteredCount} resultados
        </div>

        {isOpen && (
          <div className="filter-panel">
            {error && <div className="error-message">{error}</div>}
            <div className="filter-section">
              <label>Precio</label>
              <input
                type="number"
                placeholder="Precio máximo"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-section">
              <label>Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">Todas</option>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))
                ) : (
                  <option disabled>Cargando categorías...</option>
                )}
              </select>
            </div>
            <div className="filter-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isBacklight}
                  onChange={handleBacklightChange}
                  className="filter-checkbox"
                />
                <span className="checkbox-custom"></span>
                Solo retroiluminados
              </label>
            </div>
            <div className="filter-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isNotBacklight}
                  onChange={handleNotBacklightChange}
                  className="filter-checkbox"
                />
                <span className="checkbox-custom"></span>
                Solo no retroiluminados
              </label>
            </div>
            <div className="filter-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={hasDiscount}
                  onChange={(e) => setHasDiscount(e.target.checked)}
                  className="filter-checkbox"
                />
                <span className="checkbox-custom"></span>
                Solo con descuento
              </label>
            </div>
            <button onClick={handleApply} className="filter-button">
              Aplicar
            </button>
          </div>
        )}
      </div>

      <div className="filter-divider"></div>
    </>
  );
};

export default Filter;