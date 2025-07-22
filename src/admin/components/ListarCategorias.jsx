import { useEffect, useState } from "react";
import { listarCategorias, eliminarCategoria } from "../utils/api";

const ListarCategorias = () => {

    const [categorias, setCategorias] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [error, setError] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [idEliminando, setIdEliminando] = useState(null);

    const fetchCategorias = async () => {
        try {
            const result = await listarCategorias();

            if (result.success) {
              setCategorias(result.data.Categorias);
            } else {
              setError(result.message);
            }
        } catch (error) {
            setError(`Error al cargar las categorías: ${error.message}`);
        }
    };

    useEffect(() => {
      fetchCategorias();
    }, []);

    const handleBusqueda = (e) => {
        setBusqueda(e.target.value);
    };

    const handleEliminar = async (idCategoria) => {
      if (
        window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")
      ) {
        try {
          setEliminando(true);
          setIdEliminando(idCategoria);

          const result = await eliminarCategoria(idCategoria);

          if (result.success) {
            await fetchCategorias();
          } else {
            setError(result.message);
          }
        } catch (error) {
          setError("Error al eliminar la categoría: " + error.message);
        } finally {
          setEliminando(false);
          setIdEliminando(null);
        }
      }
    };

    const categoriasFiltradas = categorias.filter((categoria) =>
        categoria.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
      <div className="listar">
        <h2>Listar Categorías</h2>

        <div className="filtros-container">
          <input
            type="text"
            placeholder="Buscar Categoría..."
            value={busqueda}
            onChange={handleBusqueda}
            className="input-busqueda"
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {categorias.length === 0 ? (
          <p>No hay categorías disponibles.</p>
        ) : (
          <div className="tabla-container">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categoriasFiltradas.map((categoria) => (
                  <tr
                    key={categoria.idCategoria}
                    className={
                      eliminando && idEliminando === categoria.idCategoria
                        ? "eliminando"
                        : ""
                    }
                  >
                    <td>{categoria.nombre}</td>
                    <td className="acciones-celda">
                      {eliminando && idEliminando === categoria.idCategoria ? (
                        <span>Eliminando...</span>
                      ) : (
                        <button
                          onClick={() => handleEliminar(categoria.idCategoria)}
                          className="btn-eliminar"
                          title="Eliminar categoría"
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

export default ListarCategorias;