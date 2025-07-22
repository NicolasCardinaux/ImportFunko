import { useEffect, useState } from 'react';
import { listarDescuentos, eliminarDescuento } from '../utils/api';

const ListarDescuentos = () => {
    const [descuentos, setDescuentos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [idEliminando, setIdEliminando] = useState(null);

    const fetchDescuentos = async () => {
      const result = await listarDescuentos();

      if (result.success) {
        setDescuentos(result.data.Descuentos);
      } else {
        setError(result.message);
      }
    };

    useEffect(() => {
      fetchDescuentos();
    }, []);

    const handleBusqueda = (e) => {
        setBusqueda(e.target.value);
    };

    const handleEliminar = async (idDescuento) => {
      if (
        window.confirm("¿Estás seguro de que quieres eliminar este descuento?")
      ) {
        try {
          setEliminando(true);
          setIdEliminando(idDescuento);

          const result = await eliminarDescuento(idDescuento);

          if (result.success) {
            await fetchDescuentos();
          } else {
            setError(result.message);
          }
        } catch (error) {
          setError("Error al eliminar el descuento: " + error.message);
        } finally {
          setEliminando(false);
          setIdEliminando(null);
        }
      }
    };

    const descuentosFiltrados = descuentos.filter((descuento) =>
        descuento.porcentaje.toString().startsWith(busqueda) ||
        descuento.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
      <div className="listar">
        <h2>Listar Descuentos</h2>

        <div className="filtros-container">
          <input
            type="text"
            placeholder="Buscar Descuento..."
            value={busqueda}
            onChange={handleBusqueda}
            className="input-busqueda"
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {descuentos.length === 0 ? (
          <p>No hay descuentos disponibles.</p>
        ) : (
          <div className="tabla-container">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Porcentaje</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {descuentosFiltrados.map((descuento) => (
                  <tr
                    key={descuento.idDescuento}
                    className={
                      eliminando && idEliminando === descuento.idDescuento
                        ? "eliminando"
                        : ""
                    }
                  >
                    <td>{descuento.nombre || "-"}</td>
                    <td>{descuento.porcentaje}</td>
                    <td className="acciones-celda">
                      {eliminando && idEliminando === descuento.idDescuento ? (
                        <span>Eliminando...</span>
                      ) : (
                        <button
                          onClick={() => handleEliminar(descuento.idDescuento)}
                          className="btn-eliminar"
                          title="Eliminar descuento"
                          disabled={eliminando}
                        >
                          <svg
                            className="icono-basura"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
};

export default ListarDescuentos;