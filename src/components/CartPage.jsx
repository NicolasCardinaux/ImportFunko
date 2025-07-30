import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import trashIcon from "../assets/contenedor-de-basura.png";
import "../index.css";


const InlineCustomSelect = ({ options, value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);


  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="custom-select-wrapper" ref={wrapperRef}>
      <div 
        className={`custom-select-trigger ${disabled ? 'disabled' : ''}`} 
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span>{value}</span>
        <span className="custom-arrow">&#9662;</span>
      </div>
      {isOpen && (
        <div className="custom-options">
          {options.map((option) => (
            <div
              key={option}
              className="custom-option"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState(() => {
    const savedQuantities = localStorage.getItem("cartQuantities");
    return savedQuantities ? JSON.parse(savedQuantities) : {};
  });
  const [stock, setStock] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [funkoDiscounts, setFunkoDiscounts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [updatingItemIds, setUpdatingItemIds] = useState([]);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const getDiscountPercentage = (productId) => {
    const funkoDiscount = funkoDiscounts.find((discount) => discount.funko === productId);
    if (!funkoDiscount) return null;
    const discountId = funkoDiscount.descuento;
    const discountData = discounts.find((discount) => discount.idDescuento === discountId);
    return discountData ? discountData.porcentaje : null;
  };

  const getDiscountedPrice = (productId, originalPrice) => {
    const discountPercentage = getDiscountPercentage(productId);
    if (!discountPercentage) return originalPrice;
    return (originalPrice * (1 - discountPercentage / 100)).toFixed(2);
  };

  const fetchCartItemsAndStock = async () => {
    if (!token || !userId) {
      setError("Debes iniciar sesión para ver tu carrito.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cartResponse = await fetch(`https://practica-django-fxpz.onrender.com/usuarios/${userId}/carrito/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!cartResponse.ok) {
        const text = await cartResponse.text();
        throw new Error(`Error ${cartResponse.status}: ${text}`);
      }

      const data = await cartResponse.json();
      if (!data.items || data.items.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const funkosResponse = await fetch("https://practica-django-fxpz.onrender.com/funkos", {
        headers: { Authorization: `Token ${token}` },
      });
      if (!funkosResponse.ok) {
        throw new Error("Error al obtener funkos");
      }
      const funkosData = await funkosResponse.json();

      const funkosMap = funkosData.funkos.reduce((acc, funko) => {
        acc[funko.idFunko] = funko.stock;
        return acc;
      }, {});
      setStock(funkosMap);

      const groupedItems = data.items.reduce((acc, item) => {
        const key = item.funko;
        if (!acc[key]) {
          acc[key] = { ...item, idCarritoItem: item.idCarritoItem, cantidad: item.cantidad };
        }
        return acc;
      }, {});

      const itemsWithDetails = Object.values(groupedItems).map((item) => {
        const funko = funkosData.funkos.find((f) => f.idFunko === item.funko);
        return {
          ...item,
          name: funko?.nombre || "Desconocido",
          price: funko?.precio || 0,
          image: funko?.imagen?.url || "https://via.placeholder.com/50",
        };
      });

      setCartItems(itemsWithDetails);

      const initialQuantities = itemsWithDetails.reduce((acc, item) => {
        acc[item.idCarritoItem] = item.cantidad;
        return acc;
      }, {});
      setQuantities(initialQuantities);
      localStorage.setItem("cartQuantities", JSON.stringify(initialQuantities));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("https://practica-django-fxpz.onrender.com/funkodescuentos")
      .then((response) => response.json())
      .then((data) => {
        setFunkoDiscounts(data[0] || []);
      })
      .catch(console.error);

    fetch("https://practica-django-fxpz.onrender.com/descuentos")
      .then((response) => response.json())
      .then((data) => {
        setDiscounts(data.Descuentos || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchCartItemsAndStock();
  }, [token, userId]);

  const removeFromCart = async (cartItemId) => {
    if (!token) {
      setError("Debes iniciar sesión para eliminar del carrito.");
      return;
    }

    try {
      const itemToRemove = cartItems.find(item => item.idCarritoItem === cartItemId);
      const response = await fetch("https://practica-django-fxpz.onrender.com/carritos", {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idFunko: itemToRemove.funko }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error ${response.status}: ${text}`);
      }

      await fetchCartItemsAndStock();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateQuantity = async (cartItemId, change, funkoId) => {
    const currentQuantity = quantities[cartItemId] || 1;
    const availableStock = stock[funkoId] || 0;
    const newQuantity = Math.max(1, Math.min(currentQuantity + change, availableStock));

    if (newQuantity === currentQuantity) return;

    setUpdatingItemIds((prev) => [...prev, cartItemId]);

    try {
      const deleteResponse = await fetch("https://practica-django-fxpz.onrender.com/carritos", {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idFunko: funkoId }),
      });

      if (!deleteResponse.ok) {
        const text = await deleteResponse.text();
        throw new Error(`Error al eliminar el ítem: ${deleteResponse.status} - ${text}`);
      }

      const postResponse = await fetch("https://practica-django-fxpz.onrender.com/carritos", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idFunko: funkoId,
          cantidad: newQuantity,
        }),
      });

      if (!postResponse.ok) {
        const text = await postResponse.text();
        throw new Error(`Error al actualizar la cantidad: ${postResponse.status} - ${text}`);
      }

      setQuantities((prev) => {
        const newQuantities = { ...prev, [cartItemId]: newQuantity };
        localStorage.setItem("cartQuantities", JSON.stringify(newQuantities));
        return newQuantities;
      });

      await fetchCartItemsAndStock();
    } catch (err) {
      setError(err.message);
      setQuantities((prev) => ({ ...prev, [cartItemId]: currentQuantity }));
    } finally {
      setUpdatingItemIds((prev) => prev.filter((id) => id !== cartItemId));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const isOutOfStock = stock[item.funko] === 0;
      if (isOutOfStock) return total;
      const price = getDiscountedPrice(item.funko, item.price);
      const quantity = quantities[item.idCarritoItem] || 1;
      return total + parseFloat(price) * quantity;
    }, 0);
  };

  const handleProductClick = (funkoId) => {
    navigate(`/product/${funkoId}`);
  };

  const hasOutOfStock = cartItems.some(item => stock[item.funko] === 0);

  if (loading) return <p className="loading-message">Cargando carrito...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="cart-container">
      <h2 className="cart-title">Tu Carrito de Compras</h2>
      {cartItems.length === 0 ? (
        <p className="cart-empty">Tu carrito está vacío.</p>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => {
                  const isOutOfStock = stock[item.funko] === 0;

                  return (
                    <tr key={item.idCarritoItem} style={{ position: "relative" }}>
                      <td colSpan="5" style={{ padding: 0, position: "relative" }}>
                        <div className={`cart-item-row ${isOutOfStock ? "out-of-stock-container" : ""}`}>
                          {isOutOfStock && (
                            <div className="out-of-stock-overlay">
                              <p>🚫 El producto se ha agotado.<br />Debes eliminarlo del carrito.</p>
                            </div>
                          )}

                          <div className="cart-item-info">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="cart-item-image"
                              onClick={() => handleProductClick(item.funko)}
                              style={{ cursor: "pointer" }}
                            />
                            <span className="cart-item-name">{item.name}</span>
                          </div>

                          <div className="cart-item-price">
                            {getDiscountPercentage(item.funko) ? (
                              <div className="price-stack">
                                <span className="original-price">${item.price.toFixed(2)}</span>
                                <span className="discounted-price">${getDiscountedPrice(item.funko, item.price)}</span>
                              </div>
                            ) : (
                              <span className="regular-price">${item.price.toFixed(2)}</span>
                            )}
                          </div>

                          <div className="cart-item-quantity">
                            {!isOutOfStock ? (
                              <div className="cart-quantity-control">
                                {}
                                <InlineCustomSelect
                                  options={Array.from({ length: stock[item.funko] || 1 }, (_, i) => i + 1)}
                                  value={quantities[item.idCarritoItem] || 1}
                                  onChange={(newQuantity) => {
                                      updateQuantity(item.idCarritoItem, newQuantity - (quantities[item.idCarritoItem] || 1), item.funko);
                                  }}
                                  disabled={updatingItemIds.includes(item.idCarritoItem)}
                                />
                                {}
                              </div>
                            ) : (
                              <span style={{ color: "#999", fontWeight: "bold" }}>No disponible</span>
                            )}
                          </div>

                          <div className="cart-item-subtotal">
                            {!isOutOfStock ? (
                              <>
                                ${(
                                  getDiscountedPrice(item.funko, item.price) *
                                  (quantities[item.idCarritoItem] || 1)
                                ).toFixed(2)}
                              </>
                            ) : (
                              <>$0.00</>
                            )}
                          </div>

                          <div className={`cart-item-action ${isOutOfStock ? 'overlay-position' : ''}`}>
                            <button
                              className={`cart-remove-button ${isOutOfStock ? 'overlay-remove-btn' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromCart(item.idCarritoItem);
                              }}
                            >
                              <img src={trashIcon} alt="Eliminar" className="cart-trash-icon" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="cart-summary">
            <h3>Resumen de Compra</h3>
            <p>Subtotal: ${calculateTotal().toFixed(2)}</p>
            <p className="total-price">Total: ${calculateTotal().toFixed(2)}</p>
            <button
              className="cart-checkout-button"
              onClick={() => navigate("/checkout")}
              disabled={hasOutOfStock}
              title={hasOutOfStock ? "No puedes comprar productos sin stock" : ""}
            >
              Realizar Compra
            </button>
            {hasOutOfStock && (
              <p className="cart-out-of-stock-message">
                No puedes realizar la compra mientras haya productos sin stock.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;