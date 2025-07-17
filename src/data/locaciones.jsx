import localidades from './localidades.json';

// Normalizar strings (acentos, mayúsculas, espacios)
const normalizeString = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

/**
 * Buscar código postal por provincia y ciudad (coincidencia parcial y flexible).
 * @param {string} provincia - Nombre de la provincia.
 * @param {string} ciudad - Nombre ingresado por el usuario.
 * @returns {string|null} Código postal si se encuentra, null si no.
 */
export const buscarCodigoPostal = (provincia, ciudad) => {
  const provinciaNorm = normalizeString(provincia);
  const ciudadNorm = normalizeString(ciudad);

  const match = localidades.find(loc => {
    return (
      normalizeString(loc.provincia) === provinciaNorm &&
      normalizeString(loc.nombre).includes(ciudadNorm)
    );
  });

  return match ? String(match.cod_postal) : null;
};
