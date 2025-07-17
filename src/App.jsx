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

  useEffect(() => {
    if (
      !isAuthenticated &&
      location.pathname !== "/login" &&
      location.pathname !== "/register" &&
      location.pathname !== "/quienes-somos" &&
      !location.pathname.startsWith("/product/")
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
        location.pathname === "/my-purchases") &&
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
        </Routes>
      </main>
  
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;