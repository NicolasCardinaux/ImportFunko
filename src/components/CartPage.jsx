import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import trashIcon from "../assets/contenedor-de-basura.png";
import "../index.css";

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
        acc[item.idCarritoItem] = quantities[item.idCarritoItem] || item.cantidad;
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

  const updateQuantity = async (cartItemId, change) => {
    const currentQuantity = quantities[cartItemId] || 1;
    const item = cartItems.find(item => item.idCarritoItem === cartItemId);
    const availableStock = stock[item?.funko] || 0;
    const newQuantity = Math.max(1, Math.min(currentQuantity + change, availableStock));

    if (newQuantity === currentQuantity) return;

    setQuantities((prev) => {
      const newQuantities = { ...prev, [cartItemId]: newQuantity };
      localStorage.setItem("cartQuantities", JSON.stringify(newQuantities));
      return newQuantities;
    });

    try {
      await fetch(`https://practica-django-fxpz.onrender.com/carritos`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idCarritoItem: cartItemId,
          cantidad: newQuantity,
          idFunko: item.funko,
        }),
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = getDiscountedPrice(item.funko, item.price);
      const quantity = quantities[item.idCarritoItem] || 1;
      return total + price * quantity;
    }, 0);
  };

  const handleProductClick = (funkoId) => {
    navigate(`/product/${funkoId}`);
  };

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
                {cartItems.map((item, index) => (
                  <tr key={item.idCarritoItem} style={{ "--index": index, cursor: "pointer" }} onClick={() => handleProductClick(item.funko)}>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <img src={item.image} alt={item.name} className="cart-item-image" />
                        <span className="cart-item-name">{item.name}</span>
                      </div>
                    </td>

                    <td>
                      {getDiscountPercentage(item.funko) ? (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ textDecoration: "line-through", color: "#666" }}>
                            ${item.price.toFixed(2)}
                          </span>
                          <span style={{ color: "#D32F2F", fontWeight: "bold" }}>
                            ${getDiscountedPrice(item.funko, item.price)}
                          </span>
                        </div>
                      ) : (
                        <>${item.price.toFixed(2)}</>
                      )}
                    </td>

                    <td>
                      <div className="cart-quantity-control">
                        <button
                          className="cart-quantity-btn"
                          onClick={(e) => { e.stopPropagation(); updateQuantity(item.idCarritoItem, -1); }}
                          disabled={quantities[item.idCarritoItem] === 1}
                        >-</button>
                        <input
                          type="text"
                          className="cart-quantity-input"
                          value={quantities[item.idCarritoItem] || 1}
                          readOnly
                        />
                        <button
                          className="cart-quantity-btn"
                          onClick={(e) => { e.stopPropagation(); updateQuantity(item.idCarritoItem, 1); }}
                        >+</button>
                      </div>
                    </td>

                    <td>
                      ${(
                        getDiscountedPrice(item.funko, item.price) *
                        (quantities[item.idCarritoItem] || 1)
                      ).toFixed(2)}
                    </td>

                    <td>
                      <button
                        className="cart-remove-button"
                        onClick={(e) => { e.stopPropagation(); removeFromCart(item.idCarritoItem); }}
                      >
                        <img src={trashIcon} alt="Eliminar" className="cart-trash-icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cart-summary">
            <h3>Resumen de Compra</h3>
            <p>Subtotal: ${calculateTotal().toFixed(2)}</p>
            <p>Impuestos: ${(calculateTotal() * 0.21).toFixed(2)} (21%)</p>
            <p className="total-price">Total: ${(calculateTotal() * 1.21).toFixed(2)}</p>
            <button className="cart-checkout-button" onClick={() => navigate("/checkout")}>
              Realizar Compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
