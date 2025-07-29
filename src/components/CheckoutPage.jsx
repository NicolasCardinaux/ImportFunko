import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { buscarCodigoPostal } from '../data/locaciones';
import "../index.css";


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
  const [subtotal, setSubtotal] = useState(null);
  const [cantidad, setCantidad] = useState(0);
  const [shipping, setShipping] = useState({ domicilio: null, sucursal: null, seleccion: "domicilio" });
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [cargandoProvincias, setCargandoProvincias] = useState(false);
  const [cargandoCiudades, setCargandoCiudades] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [funkoDiscounts, setFunkoDiscounts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [quantities, setQuantities] = useState(() => {
    const savedQuantities = localStorage.getItem("cartQuantities");
    return savedQuantities ? JSON.parse(savedQuantities) : {};
  });
  const [isMpScriptLoaded, setIsMpScriptLoaded] = useState(false);


  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;

    script.onload = () => {
      setIsMpScriptLoaded(true);
    };

    if (!document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]')) {
      document.body.appendChild(script);
    } else {
      setIsMpScriptLoaded(true);
    }
    
    return () => {
      const existingScript = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');
      if (existingScript) {

      }
    };
  }, []);


  const normalizeString = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };


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
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const fetchCart = async () => {
      setIsCartLoading(true);
      setError("");

      if (!token || !userId) {
        setError("Debes iniciar sesión para proceder con la compra.");
        setIsCartLoading(false);
        return;
      }

      
      if (discounts.length === 0) {
        return; 
      }

      try {
        const [cartResponse, funkosResponse] = await Promise.all([
            fetch(`https://practica-django-fxpz.onrender.com/usuarios/${userId}/carrito/`, {
                method: "GET",
                headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
            }),
            fetch("https://practica-django-fxpz.onrender.com/funkos", {
                headers: { Authorization: `Token ${token}` },
            }),
        ]);

        if (!cartResponse.ok) throw new Error(`Error al obtener el carrito: ${cartResponse.status}`);
        if (!funkosResponse.ok) throw new Error("Error al obtener los productos.");

        const cartData = await cartResponse.json();
        const funkosData = await funkosResponse.json();
        
        if (!Array.isArray(funkosData.funkos)) {
          throw new Error("Los datos de los productos no tienen el formato esperado.");
        }

        if (!cartData.items || cartData.items.length === 0) {
          setSubtotal(0);
          setCantidad(0);
          setError("El carrito está vacío.");
          setIsCartLoading(false);
          return;
        }

        const itemsWithDetails = cartData.items.map((item) => {
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
          const quantity = quantities[item.idCarritoItem] || item.cantidad || 1;
          return acc + price * quantity;
        }, 0);

        const totalCantidad = itemsWithDetails.reduce((acc, item) => {
          const quantity = quantities[item.idCarritoItem] || item.cantidad || 1;
          return acc + quantity;
        }, 0);

        setSubtotal(total);
        setCantidad(totalCantidad);

      } catch (err) {
        setError(err.message);
        setSubtotal(0);
      } finally {
        setIsCartLoading(false);
      }
    };

    if (user) fetchCart();
  }, [quantities, user, funkoDiscounts, discounts]); 
  

  const handleChange = (e) => {
    setFormError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };


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


  const calcularEnvio = async () => {
    if (!validarFormulario()) return;

    setError("");
    setFormError("");
    setIsCalculating(true);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; 
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

      const baseCost = distance * PRICE_PER_KM;

      let domicilio = baseCost;
      for (let i = 1; i < cantidad; i++) {
        domicilio = domicilio * 1.1;
      }
      const sucursal = domicilio * 0.8;

      setShipping({ domicilio: Math.round(domicilio), sucursal: Math.round(sucursal), seleccion: "domicilio" });
    } catch (err) {
      console.error("[ShippingCalculator] Error:", err);
      setError("No se pudo calcular el envío. Verifique el código postal e intente de nuevo.");
      setShipping({ domicilio: null, sucursal: null, seleccion: "domicilio" });
    } finally {
      setIsCalculating(false);
    }
  };
  //NEW
const [isProcessing, setIsProcessing] = useState(false);
const [lastFormData, setLastFormData] = useState(null); // Para comparar cambios en el formulario

const confirmarCompra = async () => {
  if (!isMpScriptLoaded || isProcessing) {
    setFormError("El método de pago aún está cargando o la compra está en proceso.");
    return;
  }
  if (!validarFormulario()) return;
  if (shipping.domicilio === null) {
    setFormError("Por favor, primero calcule el costo de envío.");
    return;
  }

  setIsProcessing(true);
  const costoDeEnvio = shipping.seleccion === "domicilio" ? shipping.domicilio : shipping.sucursal;

  try {
    // Limpiar el contenedor del widget antes de crear uno nuevo
    document.getElementById("wallet_container").innerHTML = "";

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

    const idireccionData = await addressResponse.json();
    const direccion_id = idireccionData.id_direccion;

    const preferenceResponse = await fetch('https://practica-django-fxpz.onrender.com/create-preference-from-cart/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${user?.token}`,
      },
      credentials: 'include',
      body: JSON.stringify({
        direccion_id: direccion_id,
        envio: costoDeEnvio,
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
    const mp = new window.MercadoPago('APP_USR-629234dd-ead6-4264-af26-77253aa46c39');
    mp.bricks().create("wallet", "wallet_container", {
      initialization: {
        preferenceId: preferenceId,
      },
      customization: {
        texts: {
          valueProp: 'smart_option',
        },
      },
    }).catch(error => {
      console.error("Error al cargar el widget de Wallet:", error);
      setFormError("No se pudo cargar el widget de pago.");
    });

    // Guardar el estado actual del formulario como referencia para detectar cambios
    setLastFormData({ ...form, shipping: { ...shipping } });
  } catch (err) {
    console.error(err);
    setFormError(err.message || "Ocurrió un error durante el proceso de compra.");
  } finally {
    setIsProcessing(false);
  }
};

// Detectar cambios en el formulario
useEffect(() => {
  if (lastFormData) {
    const hasChanged = Object.keys(form).some(key => form[key] !== lastFormData[key]) ||
      shipping.seleccion !== lastFormData.shipping.seleccion ||
      shipping.domicilio !== lastFormData.shipping.domicilio ||
      shipping.sucursal !== lastFormData.shipping.sucursal;
    // No necesitas hacer nada aquí más allá de detectar el cambio; el botón se habilitará si isProcessing es false
  }
}, [form, shipping, lastFormData]);

//NEW
  const envioSeleccionado = shipping.seleccion === "domicilio" ? shipping.domicilio : shipping.sucursal;
  const totalFinal = (subtotal || 0) + (envioSeleccionado || 0);

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
          _name="codigoPostal"
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
        {isCartLoading ? (
          <p>Cargando resumen...</p>
        ) : (
          <>
            <p>Subtotal: ${subtotal !== null ? subtotal.toFixed(2) : '0.00'}</p>
            <p>Envío: ${envioSeleccionado !== null ? envioSeleccionado.toFixed(2) : 'A calcular'}</p>
            <p className="total-price">Total: ${totalFinal.toFixed(2)}</p>
          </>
        )}

        <label className="mercado-pago-label">
          <input type="radio" checked readOnly /> Pago con Mercado Pago
        </label>
          {/*NEW*/}
          <button
            onClick={confirmarCompra}
            className="confirm-purchase-button"
            disabled={!isMpScriptLoaded || isCartLoading || subtotal === null || isProcessing}
          >
            {isProcessing ? 'Procesando...' : isMpScriptLoaded ? 'Proceder con la compra' : 'Cargando pago...'}
          </button>
          <div id="wallet_container"></div>
          {/*NEW*/}
      </div>
    </div>
  );
};

export default CheckoutPage;