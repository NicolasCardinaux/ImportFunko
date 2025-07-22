import { useEffect, useState } from 'react';
import { listarFunkos } from '../utils/api';
import '../styles/home.css';

export default function Home() {

    const [stats, setStats] = useState({
        totalFunkos: 0,
        outOfStock: 0,
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchFunkoStats = async () => {
            try {
                    const result = await listarFunkos();
                    if (result.success) {
                        const funkos = result.data.funkos || [];
                        setStats({
                        totalFunkos: funkos.length,
                        outOfStock: funkos.filter(funko => funko.stock === 0).length,
                        loading: false,
                        error: null
                        });
                    } else {
                        setStats(prev => ({
                            ...prev,
                            loading: false,
                            error: result.message || "Error al cargar los funkos"
                        }));
                    }
                } catch (error) {
                    setStats(prev => ({
                        ...prev,
                        loading: false,
                        error: "Error de conexión: " + error.message
                    }));
                }
            }
        fetchFunkoStats();
    }, []);

    return (
      <div className="dashboard">
        <main className="main-content">
          <div className="box">
            <h1>Bienvenido</h1>
            <p>Seleccione una opción en el menú para comenzar.</p>
            <div className="stats-container">
              {stats.loading ? (
                <div className='loading-container'>
                    <p className="loading">Cargando estadísticas...</p>
                </div>
              ) : stats.error ? (
                <div className="error-container">
                    <p className="error">Error: {stats.error}</p>
                </div>
              ) : (
                <div className="stats">
                  <div className="stat-card">
                    <h3>Total de Funkos</h3>
                    <p>{stats.totalFunkos}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Funkos sin Stock</h3>
                    <p>{stats.outOfStock}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
}