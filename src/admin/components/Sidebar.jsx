import { useNavigate, useLocation } from "react-router-dom";
import '../styles/sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="sidebar">
      <h3>Funkos</h3>
      <div className={`nav-link ${isActive('/admin/crear-funko') ? 'active' : ''}`} onClick={() => navigate('/admin/crear-funko', { replace: true })}>Crear Funko</div>
      <div className={`nav-link ${isActive('/admin/listar-funkos') ? 'active' : ''}`} onClick={() => navigate('/admin/listar-funkos', { replace: true })}>Listar Funkos</div>

      <h3>Categorías</h3>
      <div className={`nav-link ${isActive('/admin/crear-categoria') ? 'active' : ''}`} onClick={() => navigate('/admin/crear-categoria', { replace: true })}>Crear Categoría</div>
      <div className={`nav-link ${isActive('/admin/listar-categorias') ? 'active' : ''}`} onClick={() => navigate('/admin/listar-categorias', { replace: true })}>Listar Categorías</div>

      <h3>Descuentos</h3>
      <div className={`nav-link ${isActive('/admin/crear-descuento') ? 'active' : ''}`} onClick={() => navigate('/admin/crear-descuento', { replace: true })}>Crear Descuento</div>
      <div className={`nav-link ${isActive('/admin/listar-descuentos') ? 'active' : ''}`} onClick={() => navigate('/admin/listar-descuentos', { replace: true })}>Listar Descuentos</div>

      <h3>Ventas</h3>
      <div className={`nav-link ${isActive('/admin/listar-ventas') ? 'active' : ''}`} onClick={() => navigate('/admin/listar-ventas', { replace: true })}>Listar Ventas</div>

      {}
      <h3 style={{ marginTop: '5px' }}></h3> {}
      <div className="home-button-container">
        <button className="home-button" onClick={() => navigate('/', { replace: true })}>Volver al Home</button>
      </div>
    </div>
  );
};

export default Sidebar;