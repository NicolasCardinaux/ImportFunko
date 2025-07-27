import React, { useEffect, useState } from 'react';
import { listarVentas, actualizarEstadoCompra } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import '../styles/list.css';


const ListarVentas = () => {
    const [ventas, setVentas] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [error, setError] = useState(null);
    const [cargandoId, setCargandoId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const result = await listarVentas();

                if (result.success) {
                    setVentas(result.data);
                } else {
                    setError(result.message || "Error al cargar ventas");
                }
            } catch (error) {
                setError("Error de conexión: " + error.message);
            }
        }
        fetchVentas();
    }, []);

    const handleBusqueda = (e) => {
        setBusqueda(e.target.value);
    };

    const cambiarEstadoVenta = async (idCompra, estadoActual) => {
        setCargandoId(idCompra);
        setError(null)

        let nuevoEstado;
        if (estadoActual === 'PENDIENTE') nuevoEstado = 'ENVIADO';
        else if (estadoActual === 'ENVIADO') nuevoEstado = 'ENTREGADO';
        else return;

        try {
            const result = await actualizarEstadoCompra(idCompra, nuevoEstado);

            if (result.success) {
                setVentas(prevVentas =>
                    prevVentas.map(venta =>
                        venta.idCompra === idCompra
                        ? { ...venta, estado: nuevoEstado }
                        : venta
                    )
                );
            } else {
                setError(result.message || "Error al actualizar el estado");
            }
        } catch (error) {
            setError(error.message || "Error en la solicitud")
        } finally {
            setCargandoId(null);
        }
    };

    const verDetallesCompra = (idCompra) => {

        navigate(`${idCompra}`);
    }

    const ventasFiltradas = ventas.filter((venta) =>
        venta.idCompra.toString().includes(busqueda)
    );

    return (
        <div className="listar">
            <h2>Listar Ventas</h2>

            <div className="filtros-container">
                <input
                    type="text"
                    placeholder="Buscar Venta..."
                    value={busqueda}
                    onChange={handleBusqueda}
                    className="input-busqueda"
                />
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {ventas.length === 0 ? (
                <p>No hay ventas disponibles.</p>
            ) : (
                <div className="tabla-container">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>ID Venta</th>
                                <th>Fecha</th>
                                <th>Email</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ventasFiltradas.map((venta) => (
                                <tr key={venta.idCompra}>
                                    <td>{venta.idCompra}</td>
                                    <td>{new Date(venta.fecha).toLocaleDateString()}</td>
                                    <td>{venta.usuario.email}</td>
                                    <td>${venta.total.toFixed(2)}</td>
                                    <td>{venta.estado}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button
                                                className="btn-detalles"
                                                onClick={() => verDetallesCompra(venta.idCompra)}
                                                title="Ver detalles"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 16 16"
                                                    style={{ fill: "#555" }}
                                                >
                                                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                                </svg>
                                            </button>

                                            {venta.estado !== "ENTREGADO" && (
                                                <button
                                                    className="btn-estado"
                                                    onClick={() =>
                                                        cambiarEstadoVenta(venta.idCompra, venta.estado)
                                                    }
                                                    disabled={cargandoId === venta.idCompra}
                                                    title="Cambiar estado"
                                                >
                                                {cargandoId === venta.idCompra ? (
                                                    <span>Cargando...</span>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        fill="currentColor"
                                                        viewBox="0 0 16 16"
                                                        style={{ fill: "#555" }}
                                                        >
                                                        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z" />
                                                    </svg>
                                                )}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ListarVentas;