import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SocialLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const isStaff = params.get("isStaff") === "true";

    if (token && userId) {
      // Normalizar el token (eliminar "Token object (...)" si el backend lo envía mal)
      const cleanToken = token.replace("Token object (", "").replace(")", "").trim() || token;

      const userData = {
        token: cleanToken,
        userId,
        isStaff,
      };

      // Guardar en localStorage y contexto
      localStorage.setItem("token", userData.token);
      localStorage.setItem("userId", userData.userId);
      localStorage.setItem("isStaff", userData.isStaff);
      login(userData);

      // Redirigir al home o ruta deseada
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath);
    } else {
      navigate("/login"); // Redirigir a login si faltan parámetros
    }
  }, [navigate, location, login]);

  return <div>Loading...</div>; // Opcional: un loader mientras procesa
};

export default SocialLogin;