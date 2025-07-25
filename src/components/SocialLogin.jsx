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
    const error = params.get("error"); // Captura el parámetro de error

    const extractToken = (rawToken) => {
      if (!rawToken) return null; // Evita el error si rawToken es null
      const match = rawToken.match(/\(([^)]+)\)/);
      return match ? match[1] : rawToken;
    };

    const cleanToken = extractToken(token);

    console.log("Parámetros recibidos en SocialLogin:", {
      token: cleanToken,
      userId,
      isStaff,
      error,
    });

    if (error) {
      // Si hay un error, redirige a /register con el mensaje de error
      const errorMessage = error.includes("duplicate key value violates unique constraint")
        ? "Ya existe un usuario con ese nombre. Por favor, elige otro nombre de usuario."
        : "Error en la autenticación. Por favor, intenta de nuevo.";
      navigate(`/register?error=${encodeURIComponent(errorMessage)}`, { replace: true });
      return;
    }

    if (cleanToken && userId) {
      const userData = {
        token: cleanToken,
        userId,
        isStaff,
      };

      localStorage.setItem("token", userData.token);
      localStorage.setItem("userId", userData.userId);
      localStorage.setItem("isStaff", userData.isStaff);
      login(userData);
      console.log("Datos guardados en localStorage:", userData);

      setTimeout(() => {
        const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath, { replace: true });
        console.log("Redirigiendo a:", redirectPath);
      }, 100);
    } else {
      console.error("Faltan parámetros en la URL:", location.search);
      navigate(`/register?error=${encodeURIComponent("Error en la autenticación. Por favor, intenta de nuevo.")}`, { replace: true });
    }
  }, [navigate, location, login]);

  return <div>Loading...</div>;
};

export default SocialLogin;