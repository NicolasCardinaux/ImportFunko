/* import React, { useEffect, useState } from "react";
import "../index.css";
import { useAuth } from "../context/AuthContext";

const BillingDetails = ({ subtotal, iva, quantity, onShippingCalculated }) => {
  const { user } = useAuth();
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [form, setForm] = useState({
    provincia: "",
    ciudad: "",
    direccion: "",
    codigoPostal: "",
    telefono: "",
    email: "",
  });

  const [shipping, setShipping] = useState({
    domicilio: null,
    sucursal: null,
    seleccion: "domicilio",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://practica-django-fxpz.onrender.com/obtener_provincias")
      .then((res) => res.json())
      .then(setProvincias)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (form.provincia) {
      fetch(`https://practica-django-fxpz.onrender.com/localidades/${form.provincia}`)
        .then((res) => res.json())
        .then(setLocalidades)
        .catch(console.error);
    }
  }, [form.provincia]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calcularEnvio = async () => {
    const { codigoPostal } = form;
    if (!codigoPostal || codigoPostal.length < 4) {
      setError("Código postal inválido");
      return;
    }

    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${codigoPostal}+Argentina&key=0e8b6f4f65b645d789c4c88377bf1494&limit=1`
    );

    const data = await response.json();
    if (!data.results.length) {
      setError("No se encontró ubicación");
      return;
    }

    const { lat, lng } = data.results[0].geometry;
    const ORIGIN_LAT = -32.4847;
    const ORIGIN_LON = -58.2329;
    const R = 6371;
    const dLat = (lat - ORIGIN_LAT) * (Math.PI / 180);
    const dLon = (lng - ORIGIN_LON) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(ORIGIN_LAT * (Math.PI / 180)) *
        Math.cos(lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    const baseCost = Math.round(distance * 10 * quantity);
    const envioDomicilio = baseCost;
    const envioSucursal = Math.round(baseCost * 0.8);

    setShipping({ domicilio: envioDomicilio, sucursal: envioSucursal, seleccion: "domicilio" });

    // Guardar dirección en API
    try {
      await fetch("https://practica-django-fxpz.onrender.com/crear-direccion/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${user?.token}`,
        },
        body: JSON.stringify({
          provincia: form.provincia,
          ciudad: form.ciudad,
          direccion: form.direccion,
          codigoPostal: form.codigoPostal,
          telefono: form.telefono,
          email: form.email,
        }),
      });
    } catch (err) {
      console.error("Error al guardar dirección:", err);
    }

    setError("");
    if (onShippingCalculated) {
      onShippingCalculated({ envioDomicilio, envioSucursal });
    }
  };

  const envioSeleccionado =
    shipping.seleccion === "domicilio"
      ? shipping.domicilio
      : shipping.sucursal;

  const totalFinal = subtotal + iva + (envioSeleccionado || 0);

  return (
    <div className="billing-details-container">
      <h2>Detalles de Facturación</h2>
      <div className="billing-form">
        <select name="provincia" value={form.provincia} onChange={handleChange}>
          <option value="">Seleccionar provincia</option>
          {provincias.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

        <select name="ciudad" value={form.ciudad} onChange={handleChange}>
          <option value="">Seleccionar ciudad</option>
          {localidades.map((l) => (
            <option key={l.id} value={l.nombre}>{l.nombre}</option>
          ))}
        </select>

        <input type="text" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" />
        <input type="text" name="codigoPostal" value={form.codigoPostal} onChange={handleChange} placeholder="Código Postal" />
        <input type="text" name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" />
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" />

        <button onClick={calcularEnvio}>Calcular Envío</button>
        {error && <p className="error-message">{error}</p>}
      </div>

      {shipping.domicilio !== null && (
        <div className="shipping-options">
          <label>
            <input
              type="radio"
              value="domicilio"
              checked={shipping.seleccion === "domicilio"}
              onChange={(e) =>
                setShipping({ ...shipping, seleccion: e.target.value })
              }
            />
            Envío a Domicilio: ${shipping.domicilio}
          </label>
          <label>
            <input
              type="radio"
              value="sucursal"
              checked={shipping.seleccion === "sucursal"}
              onChange={(e) =>
                setShipping({ ...shipping, seleccion: e.target.value })
              }
            />
            Envío a Sucursal: ${shipping.sucursal}
          </label>
        </div>
      )}

      <div className="checkout-summary">
        <p>Subtotal: ${subtotal}</p>
        <p>IVA: ${iva}</p>
        <p>Envío: ${envioSeleccionado || 0}</p>
        <p><strong>Total: ${totalFinal}</strong></p>

        <label>
          <input type="radio" checked readOnly /> Pago con Mercado Pago
        </label>

        <button onClick={() => alert("Redireccionar a Mercado Pago...")}>
          Proceder con la compra
        </button>
      </div>
    </div>
  );
};

export default BillingDetails;*/
