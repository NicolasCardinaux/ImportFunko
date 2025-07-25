import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/style.css";
import logo from "../assets/log.png";
import eyeIcon from "../assets/eye.png";
import hiddenIcon from "../assets/hidden.png";
import gitIcon from "../assets/git.png";
import twitterIcon from "../assets/logo_twitter.webp";
import googleIcon from "../assets/google.png";
import ThemeToggleButton from "./ThemeToggleButton";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const loadGoogleScript = () => {
      if (!document.getElementById("google-sdk")) {
        const script = document.createElement("script");
        script.id = "google-sdk";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => console.log("Google SDK cargado correctamente");
        script.onerror = () => console.error("Error al cargar Google SDK");
        document.body.appendChild(script);
      }
    };

    const loadFacebookScript = () => {
      if (!document.getElementById("facebook-jssdk")) {
        window.fbAsyncInit = function () {
          window.FB.init({
            appId: "1205840470714772",
            cookie: true,
            xfbml: true,
            version: "v21.0",
          });
        };

        const script = document.createElement("script");
        script.id = "facebook-jssdk";
        script.src = "https://connect.facebook.net/es_ES/sdk.js";
        script.async = true;
        document.body.appendChild(script);
      }
    };

    loadGoogleScript();
    loadFacebookScript();

    return () => {};
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const credentials = { nombre: username, password };
    console.log("Credenciales enviadas al servidor:", credentials);

    try {
      const response = await fetch("https://practica-django-fxpz.onrender.com/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Respuesta completa del servidor:", data);
        let userId;
        if (data.idUsuario) {
          userId = data.idUsuario;
        } else if (data.Usuario && data.Usuario.idUsuario) {
          userId = data.Usuario.idUsuario;
        } else {
          throw new Error("No se pudo obtener el ID del usuario de la respuesta.");
        }
        alert("Inicio de sesión exitoso.");
        const userData = {
          token: data.Token || data.token,
          userId,
          isStaff: data.is_staff ?? data.Usuario?.is_staff ?? false,
        };
        localStorage.setItem("token", userData.token);
        localStorage.setItem("userId", userData.userId);
        localStorage.setItem("isStaff", userData.isStaff);
        login(userData);
        console.log("Token almacenado en localStorage:", localStorage.getItem("token"));
        console.log("ID de usuario almacenado en localStorage:", localStorage.getItem("userId"));
        console.log("isStaff almacenado en localStorage:", localStorage.getItem("isStaff"));
        const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        const errorData = await response.json();
        console.log("Respuesta de error del servidor:", errorData);
        throw new Error(errorData.detail || "Credenciales incorrectas.");
      }
    } catch (error) {
      console.error("Error en el login:", error);
      alert(error.message || "Usuario o contraseña incorrecta.");
    }
  };

  const handleGoogleSignIn = (response) => {
    console.log("Google Sign-In Response:", response);
    const idToken = response.credential;
    fetch("https://practica-django-fxpz.onrender.com/usuarios/login_google/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: idToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Respuesta completa de Google login:", JSON.stringify(data, null, 2));
        if (data.success) {
          let userId;
          if (data.idUsuario) {
            userId = data.idUsuario;
          } else if (data.usuario && data.usuario.idUsuario) {
            userId = data.usuario.idUsuario;
          } else {
            console.error("Estructura de respuesta inesperada:", data);
            throw new Error("No se pudo obtener el ID del usuario de la respuesta.");
          }
          alert("Inicio de sesión exitoso con Google.");
          const userData = {
            token: data.token,
            userId,
            isStaff: data.is_staff ?? data.usuario?.is_staff ?? false,
          };
          localStorage.setItem("token", userData.token);
          localStorage.setItem("userId", userData.userId);
          localStorage.setItem("isStaff", userData.isStaff);
          login(userData);
          console.log("Token almacenado en localStorage (Google):", localStorage.getItem("token"));
          console.log("ID de usuario almacenado en localStorage (Google):", localStorage.getItem("userId"));
          console.log("isStaff almacenado en localStorage (Google):", localStorage.getItem("isStaff"));
          const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath);
        } else {
          alert("Error al iniciar sesión con Google: " + (data.error || "Error desconocido"));
        }
      })
      .catch((error) => {
        console.error("Error en el inicio de sesión con Google:", error);
        alert("Error al iniciar sesión con Google. Por favor, intenta de nuevo.");
      });
  };

  const loginWithGoogle = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: "517355831350-kps5v0lrsqr3nuor0chso34k5va4h0oj.apps.googleusercontent.com",
        callback: handleGoogleSignIn,
        auto_select: false,
      });
      window.google.accounts.id.renderButton(document.getElementById("google-signin-button"), {
        theme: "outline",
        size: "large",
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log("Google prompt no se mostró:", notification.getNotDisplayedReason());
          window.google.accounts.id.prompt();
        }
      });
    } else {
      console.error("Google SDK no está cargado.");
      alert("Error al cargar Google Sign-In. Por favor, intenta de nuevo.");
    }
  };

  const loginWithGitHub = async () => {
    try {
      const response = await fetch("https://practica-django-fxpz.onrender.com/auth/github/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No se pudo iniciar la autenticación con GitHub");
        alert("Error al iniciar autenticación con GitHub.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al iniciar autenticación con GitHub.");
    }
  };

  const loginWithTwitterCustom = async () => {
    try {
      const response = await fetch("https://practica-django-fxpz.onrender.com/auth/twitter/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert("No se pudo iniciar la autenticación con Twitter.");
        console.error("Respuesta inválida de Twitter:", data);
      }
    } catch (error) {
      console.error("Error en el inicio de sesión con Twitter:", error);
      alert("Error al iniciar autenticación con Twitter. Por favor, intenta de nuevo.");
    }
  };

  return (
    <div className="auth-container">
      <div className="logo-container">
        <a href="/" className="logo-link" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
          <img src={logo} alt="Logo" className="logo" />
          <span className="logo-text">ImportFunko</span>
        </a>
      </div>
      <div className="theme-toggle-wrapper">
        <ThemeToggleButton />
      </div>
      <div className="container">
        <form className="register-form" id="login-form" onSubmit={handleSubmit}>
          <h2>Inicia Sesión</h2>
          <input
            type="text"
            id="username"
            placeholder="Nombre de Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              className="toggle-password"
              id="toggle-password"
              src={showPassword ? eyeIcon : hiddenIcon}
              alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={togglePasswordVisibility}
            />
          </div>
          <p>
            ¿No tenés cuenta?{" "}
            <a href="/register" onClick={(e) => { e.preventDefault(); navigate("/register"); }}>
              Regístrate aquí
            </a>
          </p>
          <button type="submit" className="submit-btn">
            Entrar
          </button>
          <div className="social-login">
            <p>o continúa con</p>
            <div className="social-icons">
              <a onClick={(e) => { e.preventDefault(); loginWithGoogle(); }}>
                <img src={googleIcon} alt="Google" />
              </a>
              <a onClick={(e) => { e.preventDefault(); loginWithGitHub(); }}>
                <img src={gitIcon} alt="GitHub" />
              </a>
              <a onClick={(e) => { e.preventDefault(); loginWithTwitterCustom(); }}>
                <img src={twitterIcon} alt="Twitter" />
              </a>
            </div>
          </div>
          <div id="google-signin-button"></div>
        </form>
      </div>
    </div>
  );
};

export default Login;