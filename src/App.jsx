import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Header from "./components/Header";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Filter from "./components/Filter";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import AboutUs from "./components/AboutUs";
import CartPage from "./components/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyPurchases from "./pages/MyPurchases";
import Login from "./components/Login";
import Register from "./components/Register";
import FavoritesPage from "./components/FavoritesPage";
import AccountPage from "./components/AccountPage";
import ThankYouComponent from "./components/ThankYouComponent"; // Importa el componente
import { useAuth } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth(); // Obtener el objeto 'user' del contexto

  // useEffect para manejar la redirección de usuarios autenticados,
  // incluyendo la redirección específica para administradores.
  useEffect(() => {
    // Si el usuario está autenticado y está en la página de login
    if (isAuthenticated && location.pathname === "/login") {
      // Verificar si el usuario es administrador
      const isStaff = user && user.isStaff; // Acceder a isStaff desde el objeto user del contexto

      if (isStaff) {
        console.log("App.jsx: Usuario admin logueado, redirigiendo a panel de administración.");
        window.location.href = "https://importfunko-admin.vercel.app";
      } else {
        console.log("App.jsx: Usuario común logueado en /login, redirigiendo a /.");
        navigate("/", { replace: true });
      }
    }
    // Si el usuario NO está autenticado y está intentando acceder a rutas protegidas
    else if (
      !isAuthenticated &&
      location.pathname !== "/login" &&
      location.pathname !== "/register" &&
      location.pathname !== "/quienes-somos" &&
      !location.pathname.startsWith("/product/") &&
      location.pathname !== "/thank-you"
    ) {
      console.log("App.jsx: Usuario no autenticado en ruta protegida, redirigiendo a /.");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate, user]); // Dependencias: isAuthenticated, location.pathname, navigate, y user

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category") || "";
    setFilters((prev) => ({ ...prev, category }));
  }, [location.search]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const updateFiltersWithCategory = (category) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app-wrapper">
      {!isAuthPage && <Header onSearch={handleSearch} />}

      {(location.pathname === "/" ||
        location.pathname === "/quienes-somos" ||
        location.pathname === "/mis-datos" ||
        location.pathname === "/favoritos" ||
        location.pathname === "/cart" ||
        location.pathname === "/my-purchases" ||
        location.pathname === "/thank-you") &&
        !isAuthPage && <Banner />}

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div style={{ width: "100%" }}>
                  <Filter
                    onFilterChange={handleFilterChange}
                    currentCount={currentCount}
                    totalFilteredCount={filteredCount}
                    selectedCategory={filters.category || ""}
                  />
                </div>
                <div style={{ flex: 1, width: "100%" }}>
                  <ProductList
                    filters={filters}
                    searchTerm={searchTerm}
                    setFilteredCount={setFilteredCount}
                    setCurrentCount={setCurrentCount}
                    updateFilters={updateFiltersWithCategory}
                  />
                </div>
              </>
            }
          />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/quienes-somos" element={<AboutUs />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/my-purchases" element={<MyPurchases />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/favoritos" element={<FavoritesPage />} />
          <Route
            path="/mis-datos"
            element={<AccountPage setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/thank-you" element={<ThankYouComponent />} />
          <Route path="*" element={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              minHeight: '80vh',
              fontSize: '24px',
              color: '#e74c3c'
            }}>
              <h2>Página No Encontrada</h2>
              <p>Lo sentimos, la página que buscas no existe.</p>
              <button
                onClick={() => navigate("/")}
                style={{
                  padding: '10px 20px',
                  marginTop: '20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                Volver al Inicio
              </button>
            </div>
          } />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;