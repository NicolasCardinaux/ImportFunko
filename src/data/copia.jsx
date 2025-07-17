import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import postalCodesByLocalidad from "../data/locaciones"; // Importamos el objeto postalCodesByLocalidad
import "../index.css";

// --- Constantes de cálculo de envío integradas ---
const ORIGIN_LAT = -32.4847;
const ORIGIN_LON = -58.2329;
const PRICE_PER_KM = 10;

const CheckoutPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    provincia: "",
    ciudad: "",
    direccion: "",
    codigoPostal: "",
    telefono: "",
    email: "",
  });

  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [ciudadInput, setCiudadInput] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIva] = useState(0);
  const [cantidad, setCantidad] = useState(0);
  const [shipping, setShipping] = useState({ domicilio: null, sucursal: null, seleccion: "domicilio" });
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [cargandoProvincias, setCargandoProvincias] = useState(false);
  const [cargandoCiudades, setCargandoCiudades] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false);
  const [funkoDiscounts, setFunkoDiscounts] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  // Función para normalizar strings (quitar acentos y pasar a minúsculas)
  const normalizeString = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Función para obtener el porcentaje de descuento
  const getDiscountPercentage = (productId) => {
    const funkoDiscount = funkoDiscounts.find((discount) => discount.funko === productId);
    if (!funkoDiscount) return null;
    const discountId = funkoDiscount.descuento;
    const discountData = discounts.find((discount) => discount.idDescuento === discountId);
    return discountData ? discountData.porcentaje : null;
  };

  // Función para obtener el precio con descuento
  const getDiscountedPrice = (productId, originalPrice) => {
    const discountPercentage = getDiscountPercentage(productId);
    if (!discountPercentage) return originalPrice;
    return (originalPrice * (1 - discountPercentage / 100)).toFixed(2);
  };

  // Obtener provincias de Argentina
  useEffect(() => {
    const obtenerProvincias = async () => {
      setCargandoProvincias(true);
      try {
        const response = await fetch('https://apis.datos.gob.ar/georef/api/provincias');
        const data = await response.json();
        setProvincias(data.provincias.map(p => p.nombre));
      } catch (error) {
        console.error("Error al obtener provincias:", error);
        setError("No se pudieron cargar las provincias. Intente más tarde.");
      } finally {
        setCargandoProvincias(false);
      }
    };
    obtenerProvincias();
  }, []);

  // Obtener ciudades cuando se selecciona una provincia
  useEffect(() => {
    if (form.provincia) {
      const obtenerCiudades = async () => {
        setCargandoCiudades(true);
        try {
          const response = await fetch(
            `https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(form.provincia)}&max=1000`
          );
          if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudieron cargar las ciudades.`);
          }
          const data = await response.json();
          setCiudades(data.localidades.map(l => l.nombre));
        } catch (error) {
          console.error("Error al obtener ciudades:", error);
          setError("No se pudieron cargar las ciudades. Intente más tarde.");
        } finally {
          setCargandoCiudades(false);
        }
      };
      obtenerCiudades();
    }
  }, [form.provincia]);

  // Obtener descuentos
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

  // Obtener carrito del usuario
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const fetchCart = async () => {
      if (!token || !userId) {
        setError("Debes iniciar sesión para proceder con la compra.");
        return;
      }

      try {
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

        const cartData = await cartResponse.json();
        if (!cartData.items || cartData.items.length === 0) {
          setSubtotal(0);
          setIva(0);
          setCantidad(0);
          setError("El carrito está vacío.");
          return;
        }

        const funkosResponse = await fetch("https://practica-django-fxpz.onrender.com/funkos", {
          headers: { Authorization: `Token ${token}` },
        });
        if (!funkosResponse.ok) {
          throw new Error("Error al obtener funkos");
        }
        const funkosData = await funkosResponse.json();

        const groupedItems = cartData.items.reduce((acc, item) => {
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

        const total = itemsWithDetails.reduce((acc, item) => {
          const price = parseFloat(getDiscountedPrice(item.funko, item.price));
          return acc + price * item.cantidad;
        }, 0);

        const totalCantidad = itemsWithDetails.reduce((acc, item) => acc + item.cantidad, 0);

        setSubtotal(total);
        setIva(total * 0.21);
        setCantidad(totalCantidad);
      } catch (err) {
        setError(err.message);
      }
    };

    if (token && userId) fetchCart();
  }, []);

  // Manejo del cambio en los inputs
  const handleChange = (e) => {
    setFormError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Manejo del input de ciudad con sugerencias
  const handleCiudadInput = (e) => {
    const value = e.target.value;
    setCiudadInput(value);
    setForm({ ...form, ciudad: value });

    if (value.length > 2) {
      const filtradas = ciudades.filter(c =>
        normalizeString(c).includes(normalizeString(value))
      );
      setSugerencias(filtradas.slice(0, 5));
    } else {
      setSugerencias([]);
    }
  };

  // Seleccionar ciudad y obtener código postal automáticamente con localidades.json
  const seleccionarCiudad = (nombre) => {
    setCiudadInput(nombre);
    setSugerencias([]);
    setIsLoadingPostalCode(true);

    // Normalizar provincia y ciudad para la búsqueda
    const key = `${normalizeString(form.provincia)}|${normalizeString(nombre)}`;
    const codigoPostal = postalCodesByLocalidad[key];

    // Actualizar el formulario solo con el código postal (o vacío si no se encuentra)
    setForm((prevForm) => ({
      ...prevForm,
      ciudad: nombre,
      codigoPostal: codigoPostal ? String(codigoPostal) : "",
    }));

    setIsLoadingPostalCode(false);
  };

  // Validar formulario
  const validarFormulario = () => {
    const { provincia, ciudad, direccion, codigoPostal, telefono, email } = form;
    if (!provincia || !ciudad || !direccion || !codigoPostal || !telefono || !email) {
      setFormError("Todos los campos son obligatorios.");
      return false;
    }
    if (!/^\d{4,8}$/.test(codigoPostal)) {
      setFormError("El código postal debe ser numérico y tener entre 4 y 8 dígitos.");
      return false;
    }
    if (!/^\d{6,15}$/.test(telefono)) {
      setFormError("Teléfono inválido.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Email inválido.");
      return false;
    }
    return true;
  };

  // Calcular envío
  const calcularEnvio = async () => {
    if (!validarFormulario()) return;

    setError("");
    setFormError("");
    setIsCalculating(true);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    try {
      const response = await fetch(
        `https://apis.datos.gob.ar/georef/api/localidades?codigo_postal=${form.codigoPostal}&campos=centroide&max=1`
      );

      if (!response.ok) {
        throw new Error(`Error en la respuesta de la API de geolocalización.`);
      }

      const data = await response.json();
      if (data.localidades.length === 0) {
        throw new Error("No se encontró una ubicación para el código postal ingresado.");
      }

      const { lat, lon } = data.localidades[0].centroide;
      const distance = calculateDistance(ORIGIN_LAT, ORIGIN_LON, lat, lon);

      const baseCost = distance * PRICE_PER_KM * cantidad;
      const domicilio = Math.round(baseCost);
      const sucursal = Math.round(baseCost * 0.8);

      setShipping({ domicilio, sucursal, seleccion: "domicilio" });
    } catch (err) {
      console.error("[ShippingCalculator] Error:", err);
      setError("No se pudo calcular el envío. Verifique el código postal e intente de nuevo.");
      setShipping({ domicilio: null, sucursal: null, seleccion: "domicilio" });
    } finally {
      setIsCalculating(false);
    }
  };

  // Confirmar compra
  const confirmarCompra = async () => {
    if (!validarFormulario()) return;
    if (shipping.domicilio === null) {
      setFormError("Por favor, primero calcule el costo de envío.");
      return;
    }

    try {
      await fetch("https://practica-django-fxpz.onrender.com/crear-direccion/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${user?.token}`,
        },
        body: JSON.stringify(form),
      });

      alert("Redireccionando a Mercado Pago...");
      // Aquí en el futuro redireccionarás al checkout de Mercado Pago
    } catch (err) {
      console.error(err);
      setFormError("No se pudo guardar la dirección.");
    }
  };

  const envioSeleccionado =
    shipping.seleccion === "domicilio" ? shipping.domicilio : shipping.sucursal;
  const totalFinal = subtotal + iva + (envioSeleccionado || 0);

  return (
    <div className="billing-details-container">
      <h2>Detalles de Facturación</h2>
      <div className="billing-form">
        <select
          name="provincia"
          value={form.provincia}
          onChange={handleChange}
          disabled={cargandoProvincias}
        >
          <option value="">{cargandoProvincias ? "Cargando..." : "Seleccionar provincia"}</option>
          {provincias.map((prov) => (
            <option key={prov} value={prov}>{prov}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder={cargandoCiudades ? "Cargando..." : "Ciudad"}
          value={ciudadInput}
          onChange={handleCiudadInput}
          disabled={cargandoCiudades || !form.provincia}
        />
        {sugerencias.length > 0 && (
          <ul className="sugerencias">
            {sugerencias.map((s, index) => (
              <li key={index} onClick={() => seleccionarCiudad(s)}>
                {s}
              </li>
            ))}
          </ul>
        )}

        <input
          type="text"
          name="direccion"
          value={form.direccion}
          onChange={handleChange}
          placeholder="Dirección"
        />
        <input
          type="text"
          name="codigoPostal"
          value={form.codigoPostal}
          onChange={handleChange}
          placeholder={isLoadingPostalCode ? "Cargando código postal..." : "Código Postal (solo números)"}
          disabled={isLoadingPostalCode}
        />
        <input
          type="text"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
          placeholder="Teléfono (solo números)"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <button onClick={calcularEnvio} disabled={isCalculating}>
          {isCalculating ? 'Calculando...' : 'Calcular Envío'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {formError && <p className="error-message">{formError}</p>}

      {shipping.domicilio !== null && (
        <div className="shipping-options">
          <h3>Opciones de Envío</h3>
          <label>
            <input
              type="radio"
              value="domicilio"
              checked={shipping.seleccion === "domicilio"}
              onChange={(e) => setShipping({ ...shipping, seleccion: e.target.value })}
            />
            Envío a Domicilio: ${shipping.domicilio}
          </label>
          <label>
            <input
              type="radio"
              value="sucursal"
              checked={shipping.seleccion === "sucursal"}
              onChange={(e) => setShipping({ ...shipping, seleccion: e.target.value })}
            />
            Envío a Sucursal: ${shipping.sucursal}
          </label>
        </div>
      )}

      <div className="checkout-summary">
        <h3>Resumen de Compra</h3>
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>IVA (21%): ${iva.toFixed(2)}</p>
        <p>Envío: ${envioSeleccionado !== null ? envioSeleccionado.toFixed(2) : '0.00'}</p>
        <p><strong>Total: ${totalFinal.toFixed(2)}</strong></p>

        <label className="mercado-pago-label">
          <input type="radio" checked readOnly /> Pago con Mercado Pago
        </label>

        <button onClick={confirmarCompra} className="confirm-purchase-button">
          Proceder con la compra
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;