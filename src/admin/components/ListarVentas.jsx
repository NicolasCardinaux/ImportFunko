import { useEffect, useState } from 'react';
import { listarVentas } from '../utils/api';

const ListarVentas = () => {
    const [ventas, setVentas] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [error, setError] = useState(null);

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

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {ventas.length === 0 ? (
                <p>No hay ventas disponibles.</p>
            ) : (
                <div className='tabla-container'>
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>ID Venta</th>
                                <th>Fecha</th>
                                <th>Email</th>
                                <th>Total</th>
                                <th>Estado</th>
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