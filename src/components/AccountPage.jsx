import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import eyeIcon from "../assets/eye.png"; 
import hiddenIcon from "../assets/hidden.png"; 

const AccountPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [userData, setUserData] = useState({
    idUsuario: null,
    nombre: "",
    email: "",
    contacto: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState({
    nombre: false,
    email: false,
    contacto: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || token === "null" || !userId || userId === "null") {
        setError("Debes iniciar sesión para ver tus datos.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`https://practica-django-fxpz.onrender.com/usuarios/${userId}/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("oauth_account");
          } else {
            const text = await response.text();
            throw new Error(`Error al cargar los datos del usuario: ${response.status} - ${text}`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();

        
        const isManual = data.Usuario.password && data.Usuario.password !== "";

        if (!isManual) {
          setError("oauth_account");
          setLoading(false);
          return;
        }

        setUserData({
          idUsuario: data.Usuario.idUsuario || null,
          nombre: data.Usuario.nombre || "",
          email: data.Usuario.email || "",
          contacto: data.Usuario.contacto || "",
          password: "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const enableEditing = (field) => {
    if (error === "oauth_account") {
      alert("No puedes editar datos de una cuenta creada con Google, X o GitHub.");
      return;
    }
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const saveAllFields = async () => {
    if (!token || token === "null") {
      setError("Debes iniciar sesión para actualizar tus datos.");
      return;
    }

    if (!userId || userId === "null") {
      setError("No se pudo determinar el ID del usuario.");
      return;
    }

    if (error === "oauth_account") {
      alert("No puedes actualizar datos de una cuenta creada con Google, X o GitHub.");
      return;
    }

    try {
      const payload = {
        nombre: userData.nombre,
        email: userData.email,
        contacto: userData.contacto,
        ...(userData.password && { password: userData.password }),
      };

      const response = await fetch(`https://practica-django-fxpz.onrender.com/usuarios/${userId}/`, {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al actualizar los datos: ${response.status} - ${text}`);
      }

      const updatedData = await response.json();
      setUserData((prev) => ({
        ...prev,
        nombre: updatedData.Usuario.nombre,
        email: updatedData.Usuario.email,
        contacto: updatedData.Usuario.contacto,
        password: "",
      }));
      setIsEditing({ nombre: false, email: false, contacto: false, password: false });
      alert("Datos actualizados correctamente!");
    } catch (err) {
      setError(`No se pudieron actualizar los datos. Por favor, intenta de nuevo o contacta al soporte. Detalle: ${err.message}`);
    }
  };

  const handleLogout = () => {
    logout(); 
    navigate("/login");
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteAccount = async () => {
    if (!token || token === "null" || !userId || userId === "null") {
      setError("Error de autenticación. Por favor, inicia sesión nuevamente.");
      closeDeleteModal();
      return;
    }

    try {
      const response = await fetch(`https://practica-django-fxpz.onrender.com/usuarios/${userId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al eliminar la cuenta: ${response.status} - ${text}`);
      }

      logout(); 
      closeDeleteModal();
      navigate("/"); 
      alert("Cuenta eliminada correctamente.");
    } catch (err) {
      setError(`No se pudo eliminar la cuenta. Detalle: ${err.message}`);
      closeDeleteModal();
    }
  };

  if (loading) return <div className="loading-message">Cargando datos...</div>;

  if (error === "oauth_account") {
    return (
      <div className="account-page">
        <div className="account-container oauth-panel">
          <h2 className="oauth-title">Cuenta Externa</h2>
          <p className="oauth-message">
            Tu cuenta fue creada con Google, X o GitHub. No puedes editar tus datos directamente aquí, ya que están gestionados por el proveedor de autenticación.
          </p>
          <div className="account-buttons">
            <button className="logout-button" onClick={handleLogout}>
              Cerrar Sesión
            </button>
            <button className="delete-account-button" onClick={openDeleteModal}>
              Eliminar Cuenta
            </button>
          </div>
        </div>

        {showDeleteModal && (
          <div className="delete-modal-overlay">
            <div className="delete-modal">
              <h3>Confirmar Eliminación de Cuenta</h3>
              <p>¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.</p>
              <div className="delete-modal-buttons">
                <button className="confirm-delete-button" onClick={handleDeleteAccount}>
                  Confirmar
                </button>
                <button className="reject-delete-button" onClick={closeDeleteModal}>
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="account-page">
      <div className="account-container">
        <h2 className="account-title">Mis Datos</h2>
        <div className="account-form">
          <div className="account-field">
            <label>Nombre y Apellido</label>
            {isEditing.nombre ? (
              <div className="field-edit">
                <input
                  type="text"
                  name="nombre"
                  value={userData.nombre}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div className="field-display">
                <span>{userData.nombre}</span>
                <button onClick={() => enableEditing("nombre")}>Cambiar</button>
              </div>
            )}
          </div>

          <div className="account-field">
            <label>Email</label>
            {isEditing.email ? (
              <div className="field-edit">
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div className="field-display">
                <span>{userData.email}</span>
                <button onClick={() => enableEditing("email")}>Cambiar</button>
              </div>
            )}
          </div>

          <div className="account-field">
            <label>Contraseña</label>
            {isEditing.password ? (
              <div className="field-edit password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <img
                  className="toggle-password"
                  src={showPassword ? eyeIcon : hiddenIcon}
                  alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={togglePasswordVisibility}
                />
              </div>
            ) : (
              <div className="field-display">
                <span>••••••••</span>
                <button onClick={() => enableEditing("password")}>Cambiar</button>
              </div>
            )}
          </div>

          <div className="account-field">
            <label>Teléfono</label>
            {isEditing.contacto ? (
              <div className="field-edit">
                <input
                  type="text"
                  name="contacto"
                  value={userData.contacto}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div className="field-display">
                <span>{userData.contacto}</span>
                <button onClick={() => enableEditing("contacto")}>Cambiar</button>
              </div>
            )}
          </div>

          <div className="account-buttons">
            <button className="save-all-button" onClick={saveAllFields}>
              Guardar
            </button>
            <button className="delete-account-button" onClick={openDeleteModal}>
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Confirmar Eliminación de Cuenta</h3>
            <p>¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.</p>
            <div className="delete-modal-buttons">
              <button className="confirm-delete-button" onClick={handleDeleteAccount}>
                Confirmar
              </button>
              <button className="reject-delete-button" onClick={closeDeleteModal}>
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;