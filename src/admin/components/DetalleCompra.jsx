import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { obtenerDetalleCompra, obtenerDetalleDireccion } from "../utils/api";
import '../styles/detail.css'

const DetalleCompra = () => {
  const { id } = useParams();
  const [compra, setCompra] = useState(null);
  const [direccionDetallada, setDireccionDetallada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDetalles = async () => {
      try {
        setLoading(true);
        setError(null);

        const resultado = await obtenerDetalleCompra(id);

        if (resultado.success) {
          setCompra(resultado.data);

          if (resultado.data.direccion && resultado.data.direccion.idDireccion) {
            const resultadoDireccion = await obtenerDetalleDireccion(resultado.data.direccion.idDireccion);

            if (resultadoDireccion.success) {
              setDireccionDetallada(resultadoDireccion.data);
            }
          }
        } else {
          setError(resultado.message || "Error al cargar detalles");
        }
      } catch (error) {
        setError("Error de conexión: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDetalles();
  }, [id]);

  if (loading) return <p>Cargando detalles...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!compra) return <p>No se encontró la compra</p>;

  const costoEnvio = compra.total - compra.subtotal;

  return (
    <div className="detalle-compra">
      <h2>Detalles de Compra #{compra.idCompra}</h2>

      <div className="seccion">
        <h3>Información de Envío</h3>
        <p>
          <strong>Cliente:</strong> {compra.usuario.nombre}
        </p>
        <p>
          <strong>Email:</strong> {compra.usuario.email}
        </p>
        <p>
          <strong>Contacto:</strong>{" "}
          {compra.usuario.contacto || compra.direccion.contacto}
        </p>
        <p>
          <strong>Dirección:</strong> {compra.direccion.calle}{" "}
          {compra.direccion.numero}
        </p>
        {compra.direccion.piso && compra.direccion.depto && (
          <p>
            <strong>Piso:</strong> {compra.direccion.piso}
            {"︱"}
            <strong>Depto:</strong> {compra.direccion.depto}
          </p>
        )}
        <p>
          <strong>Código Postal:</strong> {compra.direccion.codigo_postal}
        </p>
        {direccionDetallada ? (
          <>
            <p>
              <strong>Ciudad:</strong> {direccionDetallada.ciudad}
            </p>
            <p>
              <strong>Provincia:</strong> {direccionDetallada.provincia}
            </p>
          </>
        ) : (
          <p>Cargando detalles de ubicación...</p>
        )}
      </div>

      <div className="seccion">
        <h3>Productos</h3>
        <table className="tabla-productos">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {compra.items.map((item) => (
              <tr key={item.idCompraItem}>
                <td>{item.funko.nombre}</td>
                <td>{item.cantidad}</td>
                <td>${item.funko.precio.toFixed(2)}</td>
                <td>${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="totales">
          <p>
            <strong>Costo de envío:</strong> ${costoEnvio.toFixed(2)}
          </p>
          <p>
            <strong>Subtotal:</strong> ${compra.subtotal.toFixed(2)}
          </p>
          <p>
            <strong>Total:</strong> ${compra.total.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="seccion">
        <h3>Estado</h3>
        <p>
          <strong>Estado actual:</strong> {compra.estado}
        </p>
        <p>
          <strong>Fecha de compra:</strong>{" "}
          {new Date(compra.fecha).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default DetalleCompra;