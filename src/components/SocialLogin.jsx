import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Toast = ({ message, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      backgroundColor: "#f44336",
      color: "white",
      padding: "12px 20px",
      borderRadius: "5px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      zIndex: 1000,
      cursor: "pointer",
      minWidth: "250px",
      fontWeight: "bold",
    }}
    onClick={onClose}
  >
    {message}
  </div>
);

const SocialLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const isStaff = params.get("isStaff") === "true";
    const error = params.get("error");

    if (error) {
      // Mostrar el error como toast
      // Traducir error técnico a mensaje más amigable
      const friendlyMessage =
        error.includes("duplicate key value violates unique constraint")
          ? "Ya existe un usuario con dicho nombre."
          : error;

      setErrorMsg(friendlyMessage);

      // Limpiar la URL para que no quede el parámetro error visible
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState(null, "", cleanUrl);

      // Opcional: después de unos segundos, redirigir a login
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 4000);

      return; // no continuar con login
    }

    if (token && userId) {
      const extractToken = (rawToken) => {
        const match = rawToken.match(/\(([^)]+)\)/);
        return match ? match[1] : rawToken;
      };

      const cleanToken = extractToken(token);

      const userData = {
        token: cleanToken,
        userId,
        isStaff,
      };

      localStorage.setItem("token", userData.token);
      localStorage.setItem("userId", userData.userId);
      localStorage.setItem("isStaff", userData.isStaff);
      login(userData);

      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath, { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, location, login]);

  return (
    <>
      <div>Loading...</div>
      {errorMsg && <Toast message={errorMsg} onClose={() => setErrorMsg(null)} />}
    </>
  );
};

export default SocialLogin;
