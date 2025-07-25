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

    console.log("Parámetros recibidos en SocialLogin:", { token, userId, isStaff });

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
      console.log("Datos guardados en localStorage:", userData);

      // Redirigir solo después de un pequeño retraso para evitar conflictos de navegación
      setTimeout(() => {
        const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath, { replace: true });
        console.log("Redirigiendo a:", redirectPath);
      }, 100); // Retraso de 100ms para evitar throttling
    } else {
      console.error("Faltan parámetros en la URL:", location.search);
      navigate("/login", { replace: true }); // Redirigir con replace para evitar historial
    }
  }, [navigate, location, login]);

  return <div>Loading...</div>; // Loader mientras procesa
};

export default SocialLogin;