import { useEffect, useState } from 'react';
import { listarFunkos, listarCategorias, eliminarFunko } from '../utils/api';

const ListarFunkos = () => {
  const [funkos, setFunkos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [catSeleccionada, setCatSeleccionada] = useState('');
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [idEliminando, setIdEliminando] = useState(null);

  const fetchData = async () => {
    try {
      const result = await listarFunkos();

      if (result.success) {
        setFunkos(result.data.funkos);
      } else {
        setError(result.message || "Error al cargar funkos");
      }

      const catResult = await listarCategorias();

      if (catResult.success) {
        setCategorias(catResult.data.Categorias);
      } else {
        setError(
          (prev) => prev || catResult.message || "Error al cargar categorías"
        );
      }
    } catch (error) {
      setError("Error de conexión: " + error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBusqueda = (e) => {
    setBusqueda(e.target.value);
  };

  const handleCategoriaChange = (e) => {
    setCatSeleccionada(e.target.value);
  };

  const funkosFiltrados = funkos.filter((funko) => {

    const coincideNombre = funko.nombre.toLowerCase().includes(busqueda.toLowerCase());

    const categoriaFunko = funko.categoría[0]?.idCategoria;
    const coincideCategoria = !catSeleccionada || (categoriaFunko && categoriaFunko.toString() === catSeleccionada);

    return coincideNombre && coincideCategoria;
  });

  const handleEliminar = async (idFunko) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este funko?")) {
      try {
        setEliminando(true);
        setIdEliminando(idFunko);

        const result = await eliminarFunko(idFunko);

        if (result.success) {
          setFunkos(prevFunkos => prevFunkos.filter(funko => funko.idFunko !== idFunko));

          setTimeout(() => {
            fetchData();
          }, 500);
        } else {
          setError(result.message || "Error al eliminar el funko");
        }
      } catch (error) {
        setError("Error al eliminar el funko:" + error.message);
      } finally {
          setEliminando(false);
          setIdEliminando(null);
        }
      }
    };

  return (
    <div className="listar">
      <h2>Listar Funkos</h2>
      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar Funko..."
          value={busqueda}
          onChange={handleBusqueda}
          className="input-busqueda"
        />

        <div className="filtro-categoria">
          <select
            id="categoria-select"
            value={catSeleccionada}
            onChange={handleCategoriaChange}
            className="select-categoria"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.idCategoria} value={categoria.idCategoria}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="error-mensaje">{error}</p>}

      {funkos.length === 0 ? (
        <p>No hay funkos disponibles.</p>
      ) : (
        <div className="tabla-container">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Stock</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Brillante</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {funkosFiltrados.map((funko) => (
                <tr
                  key={funko.idFunko}
                  className={
                    eliminando && idEliminando === funko.idFunko
                      ? "eliminando"
                      : ""
                  }
                >
                  <td>{funko.nombre}</td>
                  <td>{funko.stock}</td>
                  <td>${funko.precio.toFixed(2)}</td>
                  <td>{funko.categoría[0]?.nombre || "-"}</td>
                  <td>{funko.is_backlight ? "Sí" : "No"}</td>
                  <td className="acciones-celda">
                    {eliminando && idEliminando === funko.idFunko ? (
                      <span>Eliminando...</span>
                    ) : (
                      <button
                        onClick={() => handleEliminar(funko.idFunko)}
                        className="btn-eliminar"
                        title="Eliminar Funko"
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

export default ListarFunkos;