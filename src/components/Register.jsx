import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/style.css";
import logo from "../assets/log.png";
import eyeIcon from "../assets/eye.png";
import hiddenIcon from "../assets/hidden.png";
import gitIcon from "../assets/git.png";
import twitterIcon from "../assets/logo_twitter.webp";
import googleIcon from "../assets/google.png";
import ThemeToggleButton from "./ThemeToggleButton";

const getCsrfTokenFromCookies = () => {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${name}=`)) {
      return cookie.substring(name.length + 1);
    }
  }
  return "";
};

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Detectar parámetro de error en la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error) {
      setErrorMessage(decodeURIComponent(error));
      navigate("/register", { replace: true });
    }
  }, [location, navigate]);

  const togglePasswordVisibility = (field) => {
    if (field === "password") setShowPassword(!showPassword);
    else setShowConfirmPassword(!showConfirmPassword);
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

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    if (username.length < 3) {
      setErrorMessage("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const phoneRegex = /^\+54\d{5}\d{6}$/;
    if (telefono && !phoneRegex.test(telefono)) {
      setErrorMessage("El número de contacto debe estar en el formato: +54 seguido de 5 dígitos de código de área y 6 dígitos de número de teléfono.");
      return;
    }

    const csrfToken = getCsrfTokenFromCookies();
    console.log("CSRF token obtenido de las cookies:", csrfToken);

    const data = { email, nombre: username, contacto: telefono || null, password };
    console.log("Datos enviados al servidor:", data);

    try {
      const response = await fetch("https://practica-django-fxpz.onrender.com/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (response.status === 201) {
        const responseData = await response.json();
        alert(responseData.mensaje || "Usuario registrado correctamente.");
        localStorage.setItem("token", responseData.token);
        localStorage.setItem("userId", responseData.idUsuario || (responseData.Usuario && responseData.Usuario.idUsuario));
        login({ token: responseData.token, userId: responseData.idUsuario || (responseData.Usuario && responseData.Usuario.idUsuario) });
        navigate("/login");
      } else if (response.status === 409) {
        setErrorMessage("El correo o nombre de usuario ya existe.");
      } else {
        const errorData = await response.json();
        console.log("Respuesta de error del servidor:", errorData);
        setErrorMessage(errorData.detail || "Error en la creación del usuario.");
      }
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      setErrorMessage(error.message || "Hubo un problema al registrar el usuario.");
    }
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
      setErrorMessage("Error al cargar Google Sign-In. Por favor, intenta de nuevo.");
    }
  };

  const handleGoogleSignIn = (response) => {
    console.log("Respuesta de inicio de sesión de Google:", response);
    const idToken = response.credential;
    fetch("https://practica-django-fxpz.onrender.com/usuarios/register_google/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: idToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Respuesta completa de Google register:", JSON.stringify(data, null, 2));
        if (data.success) {
          alert("Registro exitoso con Google.");
          let userId;
          if (data.idUsuario) {
            userId = data.idUsuario;
          } else if (data.usuario && data.usuario.idUsuario) {
            userId = data.usuario.idUsuario;
          } else {
            console.error("Estructura de respuesta inesperada:", data);
            throw new Error("No se pudo obtener el ID del usuario de la respuesta.");
          }
          const userData = { token: data.token, userId };
          localStorage.setItem("token", userData.token);
          localStorage.setItem("userId", userData.userId);
          login(userData);
          navigate("/login");
        } else {
          const errorMsg = data.error || "Error desconocido";
          // Estandarizar mensaje de error para nombre de usuario duplicado
          if (errorMsg.includes("duplicate key value violates unique constraint") ||
              errorMsg.includes("duplicate_username")) {
            setErrorMessage("Ya existe un usuario con ese nombre. Por favor, elige otro nombre de usuario.");
          } else {
            setErrorMessage("Error al registrarse con Google: " + errorMsg);
          }
        }
      })
      .catch((error) => {
        console.error("Error en el registro con Google:", error);
        setErrorMessage("Error al registrarse con Google. Por favor, intenta de nuevo.");
      });
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
        setErrorMessage("Error al iniciar autenticación con GitHub.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Error al iniciar autenticación con GitHub.");
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
        setErrorMessage("No se pudo iniciar la autenticación con Twitter.");
      }
    } catch (error) {
      console.error("Error en Twitter login:", error);
      setErrorMessage("Error al iniciar autenticación con Twitter.");
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
        <form id="register-form" className="register-form" onSubmit={handleSubmit}>
          <h2>Regístrate</h2>
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}
          <input
            type="email"
            id="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            id="username"
            placeholder="Nombre de Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            id="telefono"
            placeholder="Número de Teléfono (opcional)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
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
              onClick={() => togglePasswordVisibility("password")}
            />
          </div>
          <div className="password-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmar-contraseña"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <img
              className="toggle-password"
              id="toggle-confirmar-contraseña"
              src={showConfirmPassword ? eyeIcon : hiddenIcon}
              alt={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => togglePasswordVisibility("confirmar")}
            />
          </div>
          <p>
            ¿Ya tenés cuenta?{" "}
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
              Inicia sesión aquí
            </a>
          </p>
          <button type="submit" className="submit-btn">
            Registrarse
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

export default Register;