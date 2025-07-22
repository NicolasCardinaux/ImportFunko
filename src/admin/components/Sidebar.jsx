import { NavLink } from "react-router-dom";
import '../styles/sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h3>Funkos</h3>
      <NavLink to="/crear-funko" className="nav-link">Crear Funko</NavLink>
      <NavLink to="/listar-funkos" className="nav-link">Listar Funkos</NavLink>

      <h3>Categorías</h3>
      <NavLink to="/crear-categoria" className="nav-link">Crear Categoría</NavLink>
      <NavLink to="/listar-categorias" className="nav-link">Listar Categorías</NavLink>

      <h3>Descuentos</h3>
      <NavLink to="/crear-descuento" className="nav-link">Crear Descuento</NavLink>
      <NavLink to="/listar-descuentos" className="nav-link">Listar Descuentos</NavLink>

      <h3>Ventas</h3>
      <NavLink to="/listar-ventas" className="nav-link">Listar Ventas</NavLink>
    </div>
  );
};

export default Sidebar;