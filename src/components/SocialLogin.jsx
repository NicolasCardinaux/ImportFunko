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

    const extractToken = (rawToken) => {
      const match = rawToken.match(/\(([^)]+)\)/);
      return match ? match[1] : rawToken;
    };

    const cleanToken = extractToken(token);

    console.log("Parámetros recibidos en SocialLogin:", {
      token: cleanToken,
      userId,
      isStaff,
    });

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
      navigate("/login", { replace: true });
    }
  }, [navigate, location, login]);

  return <div>Loading...</div>;
};

export default SocialLogin;