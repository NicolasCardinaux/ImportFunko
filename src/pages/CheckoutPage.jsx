import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { buscarCodigoPostal } from '../data/locaciones';
import "../index.css";

// --- Constantes de cálculo de envío integradas ---
const ORIGIN_LAT = -32.4847;
const ORIGIN_LON = -58.2329;
const PRICE_PER_KM = 10;
const OPENCAGE_API_KEY = "0e8b6f4f65b645d789c4c88377bf1494";

const CheckoutPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    provincia: "",
    ciudad: "",
    calle: "",
    numero: "",
    piso: "",
    depto: "",
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
  const [quantities, setQuantities] = useState(() => {
    const savedQuantities = localStorage.getItem("cartQuantities");
    return savedQuantities ? JSON.parse(savedQuantities) : {};
  });
  const [isMpScriptLoaded, setIsMpScriptLoaded] = useState(false);

  // --- Efecto para cargar dinámicamente el SDK de Mercado Pago ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;

    script.onload = () => {
      setIsMpScriptLoaded(true);
    };

    // Revisar si el script ya existe para no duplicarlo
    if (!document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]')) {
      document.body.appendChild(script);
    } else {
      setIsMpScriptLoaded(true);
    }
    
    // Opcional: Limpieza al desmontar el componente
    return () => {
      const existingScript = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');
      if (existingScript) {
        // En general, es mejor no removerlo si otras partes de la app lo pueden necesitar.
        // Pero si solo se usa aquí, se podría remover.
        // document.body.removeChild(existingScript);
      }
    };
  }, []);


  // Función para normalizar strings
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

        // Calcular el total usando quantities de localStorage
        const total = itemsWithDetails.reduce((acc, item) => {
          const price = parseFloat(getDiscountedPrice(item.funko, item.price));
          const quantity = quantities[item.idCarritoItem] || item.cantidad || 1;
          return acc + price * quantity;
        }, 0);

        const totalCantidad = itemsWithDetails.reduce((acc, item) => {
          const quantity = quantities[item.idCarritoItem] || item.cantidad || 1;
          return acc + quantity;
        }, 0);

        console.log("[CheckoutPage] Cantidad total calculada:", totalCantidad);
        console.log("[CheckoutPage] Subtotal calculado:", total);

        setSubtotal(total);
        setIva(total * 0.21);
        setCantidad(totalCantidad);
      } catch (err) {
        setError(err.message);
      }
    };

    if (token && userId) fetchCart();
  }, [quantities]);

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

  // Seleccionar ciudad y obtener código postal automáticamente
  const seleccionarCiudad = (nombre) => {
    setCiudadInput(nombre);
    setSugerencias([]);
    setIsLoadingPostalCode(true);

    const codigoPostal = buscarCodigoPostal(form.provincia, nombre);

    setForm((prevForm) => ({
      ...prevForm,
      ciudad: nombre,
      codigoPostal: codigoPostal || "",
    }));

    setIsLoadingPostalCode(false);
  };

  // Validar formulario
  const validarFormulario = () => {
    const { provincia, ciudad, calle, numero, codigoPostal, telefono, email } = form;
    if (!provincia || !ciudad || !calle || !numero || !codigoPostal || !telefono || !email) {
      setFormError("Todos los campos obligatorios deben completarse.");
      return false;
    }
    if (!/^\d{4,8}$/.test(codigoPostal)) {
      setFormError("El código postal debe tener entre 4 y 8 dígitos.");
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

  // Calcular envío usando la API de OpenCage
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
        `https://api.opencagedata.com/geocode/v1/json?q=${form.codigoPostal}+Argentina&key=${OPENCAGE_API_KEY}&limit=1`
      );

      if (!response.ok) {
        throw new Error("Error en la respuesta de la API de geolocalización.");
      }

      const data = await response.json();
      if (data.results.length === 0) {
        throw new Error("No se encontró una ubicación para el código postal ingresado.");
      }

      const { lat, lng } = data.results[0].geometry;
      const distance = calculateDistance(ORIGIN_LAT, ORIGIN_LON, lat, lng);

      // Calcular costo base
      const baseCost = distance * PRICE_PER_KM;

      // Aplicar incremento del 10% por cada producto adicional
      let domicilio = baseCost;
      for (let i = 1; i < cantidad; i++) {
        domicilio = domicilio * 1.1; // Sumar 10% sobre el valor anterior
      }
      const sucursal = domicilio * 0.8; // Sucursal es 80% del costo a domicilio

      console.log("[CheckoutPage] Cálculo de envío - Código postal:", form.codigoPostal, "Cantidad:", cantidad, "Distancia:", distance, "Costo Domicilio:", Math.round(domicilio), "Costo Sucursal:", Math.round(sucursal));

      setShipping({ domicilio: Math.round(domicilio), sucursal: Math.round(sucursal), seleccion: "domicilio" });
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
    if (!isMpScriptLoaded) {
      setFormError("El método de pago aún está cargando. Por favor, espere un momento.");
      return;
    }
    if (!validarFormulario()) return;
    if (shipping.domicilio === null) {
      setFormError("Por favor, primero calcule el costo de envío.");
      return;
    }

    try {
      // First fetch: Save the address
      const addressResponse = await fetch("https://practica-django-fxpz.onrender.com/crear-direccion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${user?.token}`,
        },
        body: JSON.stringify({
          provincia: form.provincia,
          ciudad: form.ciudad,
          calle: form.calle,
          numero: form.numero,
          piso: form.piso || null,
          depto: form.depto || null,
          codigo_postal: form.codigoPostal,
          contacto: form.telefono,
          email: form.email,
        }),
      });

      if (!addressResponse.ok) {
        throw new Error("Error al guardar la dirección.");
      }
      // Extract address ID from response
      const idireccionData = await addressResponse.json();
      const direccion_id = idireccionData.id_direccion;

      // Second fetch: Create Mercado Pago preference
      const preferenceResponse = await fetch('https://practica-django-fxpz.onrender.com/create-preference-from-cart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${user?.token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          direccion_id: direccion_id,
          envio: shipping.seleccion === "domicilio" ? shipping.domicilio : shipping.sucursal
        }),
      });

      const responseText = await preferenceResponse.text();

      if (!preferenceResponse.ok) {
        console.error("Error al crear la preferencia de pago:", responseText);
        throw new Error("Error al crear la preferencia de pago.");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        console.error("La respuesta no es JSON válido:", responseText);
        throw new Error("Respuesta inválida del servidor.");
      }

      const preferenceId = data.preference_id;

      // Load the Mercado Pago Wallet widget
      const mp = new window.MercadoPago('APP_USR-61f3d47d-4634-4a02-9185-68f2255e63c2');
      mp.bricks().create("wallet", "wallet_container", {
        initialization: {
          preferenceId: preferenceId,
        },
        customization: {
          texts: {
            valueProp: 'smart_option',
          },
        },
      }).then(() => {
        console.log("Widget de Wallet cargado correctamente");
      }).catch(error => {
        console.error("Error al cargar el widget de Wallet:", error);
        setFormError("No se pudo cargar el widget de pago.");
      });
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Ocurrió un error durante el proceso de compra.");
    }
  };

  const envioSeleccionado = shipping.seleccion === "domicilio" ? shipping.domicilio : shipping.sucursal;
  const totalFinal = subtotal + iva + (envioSeleccionado || 0);

  return (
    <div className="checkout-page">
      <div className="billing-details-container">
        <h2>Detalles de Facturación</h2>
        <div className="billing-form">
          <select
            name="provincia"
            value={form.provincia}
            onChange={handleChange}
            disabled={cargandoProvincias}
          >
            <option value="">{cargandoProvincias ? "Cargando..." : "Seleccionar provincia *"}</option>
            {provincias.map((prov) => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder={cargandoCiudades ? "Cargando..." : "Ciudad *"}
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
            name="calle"
            value={form.calle}
            onChange={handleChange}
            placeholder="Calle *"
          />
          <input
            type="text"
            name="numero"
            value={form.numero}
            onChange={handleChange}
            placeholder="Número *"
          />
          <input
            type="text"
            name="piso"
            value={form.piso}
            onChange={handleChange}
            placeholder="Piso (opcional)"
          />
          <input
            type="text"
            name="depto"
            value={form.depto}
            onChange={handleChange}
            placeholder="Departamento (opcional)"
          />
          <input
            type="text"
            name="codigoPostal"
            value={form.codigoPostal}
            onChange={handleChange}
            placeholder={isLoadingPostalCode ? "Cargando código postal..." : "Código Postal (solo números) *"}
            disabled={isLoadingPostalCode}
          />
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Teléfono (solo números) *"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email *"
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
      </div>

      <div className="checkout-summary">
        <h3>Resumen de Compra</h3>
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>IVA (21%): ${iva.toFixed(2)}</p>
        <p>Envío: ${envioSeleccionado !== null ? envioSeleccionado.toFixed(2) : '0.00'}</p>
        <p className="total-price">Total: ${totalFinal.toFixed(2)}</p>

        <label className="mercado-pago-label">
          <input type="radio" checked readOnly /> Pago con Mercado Pago
        </label>

        <button
          onClick={confirmarCompra}
          className="confirm-purchase-button"
          disabled={!isMpScriptLoaded}
        >
          {isMpScriptLoaded ? 'Proceder con la compra' : 'Cargando pago...'}
        </button>
        <div id="wallet_container"></div>
      </div>
    </div>
  );
};

export default CheckoutPage;