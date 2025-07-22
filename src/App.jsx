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
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  // Nuevo useEffect para la redirección de administradores
  useEffect(() => {
    const token = localStorage.getItem("token");

    // Si no hay token, no hacemos nada aquí, la otra lógica de autenticación lo manejará
    if (!token) return;

    // Validamos el token para ver si el usuario es administrador
    fetch("https://practica-django-fxpz.onrender.com/api/user/", {
      headers: {
        Authorization: `Token ${token}`, // Usamos "Token" para Django REST Token Auth
      },
    })
      .then((res) => {
        // Si la respuesta no es OK (ej. token inválido/expirado), lo ignoramos o manejamos el error
        // No lanzamos un error aquí para no interferir con la lógica de autenticación general
        if (!res.ok) {
          console.error("Error al validar el token para el admin (posiblemente token inválido/expirado):", res.status);
          return null; // Retornamos null para no procesar más
        }
        return res.json();
      })
      .then((user) => {
        // Si el usuario existe y es un administrador, lo redirigimos
        if (user && user.is_staff) {
          window.location.href = "https://importfunko-admin.vercel.app";
        }
      })
      .catch((error) => {
        console.error("Error al validar el token para el admin:", error);
        // Aquí no redirigimos, ya que la lógica de `isAuthenticated` se encargará si el token es realmente inválido.
      });
  }, [isAuthenticated]); // Dependencia de isAuthenticated para re-validar si cambia el estado de login

  // useEffect existente para la redirección de usuarios no autenticados
  useEffect(() => {
    if (
      !isAuthenticated &&
      location.pathname !== "/login" &&
      location.pathname !== "/register" &&
      location.pathname !== "/quienes-somos" &&
      !location.pathname.startsWith("/product/") &&
      location.pathname !== "/thank-you" // Allow access to thank-you page
    ) {
      navigate("/", { replace: true });
    } else if (isAuthenticated && location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

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
        location.pathname === "/thank-you") && // Include thank-you page
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
          <Route path="/thank-you" element={<ThankYouComponent />} /> {/* Nueva ruta */}
          {/* Catch-all route for any other path not defined */}
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