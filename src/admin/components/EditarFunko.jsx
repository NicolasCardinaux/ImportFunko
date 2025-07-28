import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerFunkoPorId, actualizarFunko, listarCategorias, listarDescuentos, subirImagen, asignarDescuentoAFunko, actualizarFunkoDescuentos, eliminarFunkoDescuentos, obtenerTodosLosFunkodescuentos } from "../utils/api";
import '../styles/list.css';


const EditarFunko = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [descuentos, setDescuentos] = useState([]);
  const [descuentoSeleccionado, setDescuentoSeleccionado] = useState("");
  const [fechaExpiracion, setFechaExpiracion] = useState("");
  const [funko, setFunko] = useState({
    nombre: "",
    descripción: "",
    is_backlight: false,
    stock: 0,
    precio: 0,
    imagen: null,
    categoría: [],
  });
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [descuentoActual, setDescuentoActual] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const funkoResult = await obtenerFunkoPorId(id);

        if (funkoResult.success) {
          const funkoData = funkoResult.data.Funko || funkoResult.data;
          setFunko({
            nombre: funkoData.nombre || "",
            descripción: funkoData.descripción || "",
            is_backlight: funkoData.is_backlight || false,
            stock: funkoData.stock || 0,
            precio: funkoData.precio || 0,
            imagen: funkoData.imagen?.idImagen || null,
            categoría: (funkoData.categoría || []).map((c) => c.idCategoria),
          });

          if (funkoData.imagen?.url) {
            setPreviewUrl(funkoData.imagen.url);
          }
        } else {
          setError(funkoResult.message || "Error al cargar el funko");
        }

        const descResult = await listarDescuentos();
        if (descResult.success) {
          setDescuentos(descResult.data?.Descuentos || []);
        } else {
          setError(
            (prev) => prev || descResult.message || "Error al cargar descuentos"
          );
        }

        const catResult = await listarCategorias();
        if (catResult.success) {
          setCategorias(catResult.data?.Categorias || []);
        } else {
          setError(catResult.message || "Error al cargar categorías");
        }

        const todosFunkodescuentos = await obtenerTodosLosFunkodescuentos();

        if (todosFunkodescuentos.success && todosFunkodescuentos.data) {
          const funkodescuentosArray = todosFunkodescuentos.data[0] || [];

          const descuentosParaEsteFunko = funkodescuentosArray.filter(          
            // eslint-disable-next-line eqeqeq
            (fd) => fd.funko == id
          );

          if (descuentosParaEsteFunko.length > 0) {
            const descuentoActivo = descuentosParaEsteFunko[0];

            setDescuentoActual({
              idFunkoDescuento: descuentoActivo.idFunkoDescuento,
              idDescuento: descuentoActivo.descuento,
              fecha_inicio: descuentoActivo.fecha_inicio,
              fecha_expiracion: descuentoActivo.fecha_expiracion,
            });

            setDescuentoSeleccionado(descuentoActivo.descuento.toString());
            setFechaExpiracion(
              descuentoActivo.fecha_expiracion?.split("T")[0] || ""
            );
          } else {
            setDescuentoActual(null);
            setDescuentoSeleccionado("");
            setFechaExpiracion("");
          }
        } else {
          setDescuentoActual(null);
          setDescuentoSeleccionado("");
          setFechaExpiracion("");
        }
      } catch (error) {
        setError("Error en la carga: " + error.message);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [id]);

  const handleImagenChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setImagenArchivo(archivo);
      setPreviewUrl(URL.createObjectURL(archivo));
    }
  };

  const limpiarImagen = () => {
    setImagenArchivo(null);
    setPreviewUrl(funko.imagen ? previewUrl : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "categoría") {
      setFunko((prev) => ({
        ...prev,
        [name]: [Number(value)],
      }));
    } else if (type === "checkbox") {
      setFunko((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFunko((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let idImagen = funko.imagen;
    
    if (imagenArchivo) {
      const resultado = await subirImagen(imagenArchivo);
      if (resultado.success) {
        idImagen = resultado.data.idImagen;
      } else {
        alert(`Error al subir imagen: ${resultado.message}`);
        return;
      }
    }

    const datosParaEnviar = {
      nombre: funko.nombre,
      descripción: funko.descripción,
      is_backlight: Boolean(funko.is_backlight),
      stock: Number(funko.stock),
      precio: parseFloat(funko.precio),
      imagen: idImagen,
      categoría: funko.categoría.map((id) => Number(id)),
    };

    try {
      const resultadoActualizacion = await actualizarFunko(id, datosParaEnviar);

      if (!resultadoActualizacion.success) {
        const errorMsg =
          resultadoActualizacion.message ||
          resultadoActualizacion.error ||
          "Error desconocido al actualizar el funko";
        alert(`Error al actualizar funko: ${errorMsg}`);
        return;
      }

      if (descuentoSeleccionado) {
        const descuentoId = parseInt(descuentoSeleccionado);
        const fechaHoy = new Date().toISOString().split("T")[0];

        const hoy = new Date();
        const fechaSeleccionada = new Date(fechaExpiracion);

        if (fechaSeleccionada <= hoy) {
          alert("La fecha de expiración debe ser posterior a hoy.");
          return;
        }

        const descuentoData = {
          funko: parseInt(id),
          descuento: descuentoId,
          fecha_inicio: descuentoActual?.fecha_inicio || fechaHoy,
          fecha_expiracion: fechaExpiracion,
        };

        if (descuentoActual) {
          const resultadoDescuento = await actualizarFunkoDescuentos(
            descuentoActual.idFunkoDescuento,
            descuentoData
          );

          if (resultadoDescuento.success) {
            setDescuentoActual({
              ...descuentoActual,
              idDescuento: descuentoId,
              fecha_expiracion: fechaExpiracion,
            });
          } else {
            console.error(
              "Error actualizando descuento:",
              resultadoDescuento.message
            );
            alert(
              "Funko actualizado, pero hubo un error al actualizar el descuento."
            );
          }
        }
        else {
          const resultadoDescuento = await asignarDescuentoAFunko(
            descuentoData
          );

          if (resultadoDescuento.success) {
            setDescuentoActual({
              idFunkoDescuento: resultadoDescuento.data.idFunkoDescuento,
              idDescuento: descuentoId,
              fecha_inicio: fechaHoy,
              fecha_expiracion: fechaExpiracion,
            });
          } else {
            console.error(
              "Error creando descuento:",
              resultadoDescuento.message
            );
            alert(
              "Funko actualizado, pero hubo un error al asignar el descuento."
            );
          }
        }
      }
      else if (descuentoActual) {
        const resultadoEliminacion = await eliminarFunkoDescuentos(
          descuentoActual.idFunkoDescuento
        );

        if (resultadoEliminacion.success) {
          setDescuentoActual(null);
        } else {
          console.error(
            "Error eliminando descuento:",
            resultadoEliminacion.message
          );
          alert(
            "Funko actualizado, pero hubo un error al eliminar el descuento existente."
          );
        }
      }

      alert("Funko actualizado exitosamente!");
      navigate("/listar-funkos");
    } catch (error) {
      console.error("Error en el proceso de actualización:", error);
      alert(`Ocurrió un error inesperado: ${error.message}`);
    }
  };

  if (cargando) {
    return <div className="cargando">Cargando datos del funko...</div>;
  }

  if (error) {
    return <div className="error-mensaje">{error}</div>;
  }

  return (
    <div className="crear-container">
      <h2>Editar Funko</h2>
      <form className="crear-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={funko.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción:</label>
          <textarea
            name="descripción"
            value={funko.descripción}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Stock:</label>
          <input
            type="number"
            name="stock"
            value={funko.stock}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Precio:</label>
          <input
            type="number"
            name="precio"
            value={funko.precio}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Categoría:</label>
          <select
            name="categoría"
            value={funko.categoría[0] || ""}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.idCategoria} value={categoria.idCategoria}>
                {categoria.nombre.charAt(0).toUpperCase() +
                  categoria.nombre.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Brilla en la oscuridad</label>
          <input
            type="checkbox"
            name="is_backlight"
            checked={funko.is_backlight}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Imagen:</label>
          <input
            id="imagen"
            type="file"
            accept="image/*"
            onChange={handleImagenChange}
            ref={fileInputRef}
          />
          {previewUrl ? (
            <div className="imagen-preview">
              <img
                src={previewUrl}
                alt="Previsualización"
                style={{ maxWidth: "200px" }}
              />
              <button
                type="button"
                onClick={limpiarImagen}
                className="btn-eliminar-imagen"
              >
                x
              </button>
            </div>
          ) : funko.imagen ? (
            <div className="imagen-preview">
              <img
                src={funko.imagen.url}
                alt="Imagen actual"
                style={{ maxWidth: "200px" }}
              />
              <p>Imagen actual</p>
            </div>
          ) : (
            <p>No hay imagen</p>
          )}
        </div>

        <div className="form-group">
          <label>Descuento (opcional):</label>
          <select
            value={descuentoSeleccionado}
            onChange={(e) => setDescuentoSeleccionado(e.target.value)}
          >
            <option value="">Sin descuento</option>
            {descuentos.map((descuento) => (
              <option key={descuento.idDescuento} value={descuento.idDescuento}>
                {descuento.nombre} ({descuento.porcentaje}%)
              </option>
            ))}
          </select>
        </div>

        {descuentoSeleccionado && (
          <div className="form-group">
            <label>Fecha de expiración del descuento:</label>
            <input
              type="date"
              value={fechaExpiracion}
              onChange={(e) => setFechaExpiracion(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
        )}

        <div className="form-botones">
          <button className="btn-actualizar" type="submit">
            Actualizar Funko
          </button>
          <button
            type="button"
            className="btn-cancelar"
            onClick={() => navigate("/listar-funkos")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarFunko;