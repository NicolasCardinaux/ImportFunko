import React, { useState } from "react";


const ORIGIN_LAT = -32.4847;
const ORIGIN_LON = -58.2329;


const PRICE_PER_KM = 10;


const OPENCAGE_API_KEY = "0e8b6f4f65b645d789c4c88377bf1494";

const ShippingCalculator = ({ quantity }) => {
  const [postalCode, setPostalCode] = useState("");
  const [shippingCostDomicilio, setShippingCostDomicilio] = useState(null);
  const [shippingCostSucursal, setShippingCostSucursal] = useState(null);
  const [shippingError, setShippingError] = useState(null);

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

  const calculateShipping = async () => {
    console.log("[ShippingCalculator] Iniciando cálculo de envío...");

    if (!postalCode || postalCode.trim() === "") {
      setShippingError("Por favor, ingresa un código postal válido.");
      setShippingCostDomicilio(null);
      setShippingCostSucursal(null);
      return;
    }

    const cpClean = postalCode.trim();
    if (cpClean.length < 4 || isNaN(cpClean)) {
      setShippingError("El código postal debe ser numérico y tener al menos 4 dígitos.");
      setShippingCostDomicilio(null);
      setShippingCostSucursal(null);
      return;
    }

    try {
      setShippingError(null);
      setShippingCostDomicilio(null);
      setShippingCostSucursal(null);

      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${cpClean}+Argentina&key=${OPENCAGE_API_KEY}&limit=1`
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al consultar OpenCage: ${response.status} - ${text}`);
      }

      const data = await response.json();
      if (data.results.length === 0) {
        throw new Error("No se encontró ubicación para el código postal ingresado.");
      }

      const { lat, lng } = data.results[0].geometry;
      const locationName = data.results[0].formatted;
      console.log("[ShippingCalculator] Ubicación encontrada:", locationName);

      const distance = calculateDistance(ORIGIN_LAT, ORIGIN_LON, lat, lng);
      const baseCost = distance * PRICE_PER_KM * quantity;
      const domicilioCost = Math.round(baseCost); 
      const sucursalCost = Math.round(baseCost * 0.8); 

      setShippingCostDomicilio(domicilioCost);
      setShippingCostSucursal(sucursalCost);
    } catch (err) {
      console.error("[ShippingCalculator] Error:", err);
      setShippingError("No se pudo calcular el envío. Intenta más tarde.");
      setShippingCostDomicilio(null);
      setShippingCostSucursal(null);
    }
  };

  const handlePostalCodeChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPostalCode(value);
    }
  };

  return (
    <div className="shipping-calculator">
      <input
        type="text"
        placeholder="Código Postal"
        value={postalCode}
        onChange={handlePostalCodeChange}
        className="shipping-input"
        maxLength={8}
      />
      <button
        className="calculate-shipping-button"
        onClick={calculateShipping}
      >
        Calcular Envío
      </button>

      {(typeof shippingCostDomicilio === "number" || typeof shippingCostSucursal === "number") &&
        !shippingError && (
          <div className="shipping-costs-disp
lay">
            {typeof shippingCostDomicilio === "number" && (
              <p className="shipping-cost">Envío a domicilio: ${Math.round(shippingCostDomicilio)}</p>
            )}
            {typeof shippingCostSucursal === "number" && (
              <p className="shipping-cost">Envío a sucursal: ${Math.round(shippingCostSucursal)}</p>
            )}
          </div>
        )}

      {shippingError && <p className="shipping-error">{shippingError}</p>}
    </div>
  );
};

export default ShippingCalculator;