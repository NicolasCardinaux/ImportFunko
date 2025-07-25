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
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (
      !isAuthenticated &&
      location.pathname !== "/login" &&
      location.pathname !== "/register" &&
      location.pathname !== "/quienes-somos" &&
      !location.pathname.startsWith("/product/") &&
      !location.pathname.startsWith("/auth/")
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
  const isAdminPage = location.pathname.startsWith("/admin");

  const AdminRoute = ({ children }) => {
    if (user?.isStaff) {
      return children;
    } else {
      return <Navigate to="/" replace />;
    }
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        {!isAuthPage && !isAdminPage && <Header onSearch={handleSearch} />}
        {(location.pathname === "/" ||
          location.pathname === "/quienes-somos" ||
          location.pathname === "/mis-datos" ||
          location.pathname === "/favoritos" ||
          location.pathname === "/cart" ||
          location.pathname === "/my-purchases") &&
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
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/my-purchases" element={<MyPurchases />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/favoritos" element={<FavoritesPage />} />
            <Route path="/mis-datos" element={<AccountPage />} />
            <Route path="/thank-you" element={<ThankYouComponent />} />
            <Route path="/rejected" element={<RejectedPurchaseComponent />} />
            <Route path="/auth/github/callback" element={<Login />} /> {/* Nueva ruta para GitHub */}
            <Route path="/auth/twitter/callback" element={<Login />} /> {/* Nueva ruta para Twitter */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
        {!isAuthPage && !isAdminPage && <Footer />}
      </div>
    </div>
  );
}

export default App;