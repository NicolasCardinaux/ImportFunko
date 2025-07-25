import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Filter from "./components/Filter";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import AboutUs from "./components/AboutUs";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import MyPurchases from "./components/MyPurchases";
import Login from "./components/Login";
import Register from "./components/Register";
import FavoritesPage from "./components/FavoritesPage";
import AccountPage from "./components/AccountPage";
import ThankYouComponent from "./components/ThankYouComponent";
import RejectedPurchaseComponent from "./components/RejectedPurchaseComponent";
import AdminLayout from "./admin/AdminLayout";
import SocialLogin from "./components/SocialLogin"; // Importar el nuevo componente
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
  const { isAuthenticated, user, setAuth } = useAuth();

  // Validate token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      fetch("https://practica-django-fxpz.onrender.com/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setAuth({ isAuthenticated: true, user: data.user });
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            setAuth({ isAuthenticated: false, user: null });
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setAuth({ isAuthenticated: false, user: null });
        });
    }
  }, [setAuth]);

  // Handle redirection for protected routes
  useEffect(() => {
    if (
      !isAuthenticated &&
      !["/login", "/register", "/quienes-somos", "/"].some((path) =>
        location.pathname === path || location.pathname.startsWith("/product/")
      )
    ) {
      navigate("/login", { replace: true });
    } else if (isAuthenticated && location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Handle OAuth callbacks (GitHub and Twitter)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const githubCode = params.get("code");
    const oauthToken = params.get("oauth_token");
    const oauthVerifier = params.get("oauth_verifier");

    if (githubCode) {
      fetch(`https://practica-django-fxpz.onrender.com/auth/github/callback/?code=${githubCode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.idUsuario || (data.usuario && data.usuario.idUsuario));
            setAuth({ isAuthenticated: true, user: data.user });
            navigate("/", { replace: true });
          } else {
            console.error("GitHub login failed:", data.error || "Unknown error");
            alert("Error al iniciar sesión con GitHub: " + (data.error || "Error desconocido"));
          }
        })
        .catch((error) => {
          console.error("Error con GitHub login:", error);
          alert("Error al iniciar sesión con GitHub.");
        });
    }

    if (oauthToken && oauthVerifier) {
      fetch(
        `https://practica-django-fxpz.onrender.com/auth/twitter/callback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oauth_token: oauthToken, oauth_verifier: oauthVerifier }),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.idUsuario || (data.usuario && data.usuario.idUsuario));
            setAuth({ isAuthenticated: true, user: data.user });
            navigate("/", { replace: true });
          } else {
            console.error("Twitter login failed:", data.error || "Unknown error");
            alert("Error al iniciar sesión con Twitter: " + (data.error || "Error desconocido"));
          }
        })
        .catch((error) => {
          console.error("Error con Twitter login:", error);
          alert("Error al iniciar sesión con Twitter.");
        });
    }
  }, [navigate, setAuth]);

  // Sync filters with URL query params
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
  const isAdminPage = location.pathname.startsWith("/admin");

  // Enhanced AdminRoute with unauthorized message
  const AdminRoute = ({ children }) => {
    if (user?.isStaff) {
      return children;
    }
    return (
      <div className="unauthorized">
        <h2>No autorizado</h2>
        <p>Debes ser administrador para acceder a esta página.</p>
        <button onClick={() => navigate("/")}>Volver al inicio</button>
      </div>
    );
  };

  // New PrivateRoute for protected routes
  const PrivateRoute = ({ children }) => {
    if (isAuthenticated) {
      return children;
    }
    return <Navigate to="/login" replace />;
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        {!isAuthPage && !isAdminPage && <Header onSearch={handleSearch} />}
        {(location.pathname === "/" ||
          location.pathname === "/quienes-somos" ||
          location.pathname === "/mis-datos" ||
          location.pathname === "/favoritos" ||
          location.pathname === "/carrito" ||
          location.pathname === "/mis-compras") &&
          !isAuthPage &&
          !isAdminPage && <Banner />}
        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <div>
                    <Filter
                      onFilterChange={handleFilterChange}
                      currentCount={currentCount}
                      totalFilteredCount={filteredCount}
                      selectedCategory={filters.category || ""}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
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
            <Route path="/carrito" element={<PrivateRoute><CartPage /></PrivateRoute>} />
            <Route path="/pago" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
            <Route path="/mis-compras" element={<PrivateRoute><MyPurchases /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/favoritos" element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
            <Route path="/mis-datos" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
            <Route path="/gracias" element={<PrivateRoute><ThankYouComponent /></PrivateRoute>} />
            <Route path="/rechazado" element={<PrivateRoute><RejectedPurchaseComponent /></PrivateRoute>} />
            <Route path="/admin/*" element={<AdminRoute><AdminLayout /></AdminRoute>} />
            <Route path="/social-login" element={<SocialLogin />} /> {/* Nueva ruta para social login */}
          </Routes>
        </main>
        {!isAuthPage && !isAdminPage && <Footer />}
      </div>
    </div>
  );
}

export default App;