import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GitHubCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      fetch("https://practica-django-fxpz.onrender.com/auth/github/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.token && data.idUsuario) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.idUsuario);
            login({ token: data.token, userId: data.idUsuario });
            navigate("/");
          } else {
            alert("Error al iniciar sesión con GitHub");
          }
        })
        .catch(err => {
          console.error("Error al autenticar:", err);
          alert("Error al iniciar sesión con GitHub.");
        });
    } else {
      alert("No se encontró código de autenticación en la URL.");
    }
  }, []);

  return <p>Procesando autenticación con GitHub...</p>;
};

export default GitHubCallback;
