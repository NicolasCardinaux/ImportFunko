import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import CrearFunko from './components/CrearFunko';
import ListarFunkos from './components/ListarFunkos';
import CrearCategoria from './components/CrearCategoria';
import ListarCategorias from './components/ListarCategorias';
import CrearDescuento from './components/CrearDescuento';
import ListarDescuentos from './components/ListarDescuentos';
import ListarVentas from './components/ListarVentas';
import EditarFunko from './components/EditarFunko';
import DetalleCompra from './components/DetalleCompra';

import './App.module.css';

const AdminLayout = () => {
  return (
    <div
      className="admin-wrapper"
      style={{
        backgroundColor: '#fff',
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <Sidebar />
      <div
        className="admin-content"
        style={{
          marginLeft: '220px',
          padding: '20px',
          width: 'calc(100vw - 220px)',
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="crear-funko" element={<CrearFunko />} />
          <Route path="listar-funkos" element={<ListarFunkos />} />
          <Route path="crear-categoria" element={<CrearCategoria />} />
          <Route path="listar-categorias" element={<ListarCategorias />} />
          <Route path="crear-descuento" element={<CrearDescuento />} />
          <Route path="listar-descuentos" element={<ListarDescuentos />} />
          <Route path="listar-ventas" element={<ListarVentas />} />
          <Route path="editar-funko/:id" element={<EditarFunko />} />
          <Route path="listar-ventas/:id" element={<DetalleCompra />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminLayout;
