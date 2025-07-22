const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_TOKEN = process.env.REACT_APP_API_TOKEN;

export const crearFunko = async (funkoData) => {
  try {
    console.log("Creando funko con datos:", funkoData);
    
    const response = await fetch(`${BASE_URL}/funkos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`,
      },
      body: JSON.stringify(funkoData),
    });

    console.log("Respuesta al crear funko:", response);

    if (response.status === 201) {
      const data = await response.json();
      console.log("Funko creado exitosamente. Datos:", data);
      return { success: true, data };
    } else {
      const errorData = await response.json();
      console.error("Error al crear funko:", errorData);
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    console.error("Excepción al crear funko:", error);
    return { success: false, message: `Error en la solicitud: ${error.message}` };
  }
};

export const listarFunkos = async () => {
  try {
    const response = await fetch(`${BASE_URL}/funkos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`,
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    return { success: false, message: `Error en la solicitud: ${error.message}` };
  }
};

export const crearCategoria = async (categoriaData) => {
  try {
    const response = await fetch(`${BASE_URL}/categorias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`,
      },
      body: JSON.stringify(categoriaData),
    });

    if (response.status === 201) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    return { success: false, message: `Error en la solicitud: ${error.message}` };
  }
};

export const listarCategorias = async () => {
  try {
    const response = await fetch(`${BASE_URL}/categorias`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`,
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    return { success: false, message: `Error en la solicitud: ${error.message}` };
  }
};

export const crearDescuento = async (descuentoData) => {
  try {
    const response = await fetch(`${BASE_URL}/descuentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`,
      },
      body: JSON.stringify(descuentoData),
    });

    if (response.status === 201) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    return { success: false, message: `Error en la solicitud: ${error.message}` };
  }
};

export const listarDescuentos = async () => {
  try {
    const response = await fetch(`${BASE_URL}/descuentos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    return { success: false, message: `Error en la solicitud: ${error.message}` };
  }
};

export const listarVentas = async () => {
  try {
    const response = await fetch(`${BASE_URL}/compras`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`,
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      return { success: true, data}
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.message};
    }
  } catch (error) {
    return { success: false, message: `Error en la solicitud: ${error.message}`};
  }
};

export const subirImagen = async (archivo) => {
  const formData = new FormData();
  formData.append('imagen', archivo);

  try {
    console.log("Subiendo imagen...");
    const response = await fetch(`${BASE_URL}/imagenes/`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
      },
    });

    if (response.ok) {
      const data = await response.json();

      const idImagen = data.Imagen.idImagen;
      
      return { 
        success: true, 
        data: {
          idImagen: idImagen,
          ...data.Imagen
        } 
      };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    return { success: false, message: `Error en la solicitud: ${error.message}` };
  }
};

export const eliminarFunko = async (idFunko) => {
  try {
    const response = await fetch(`${BASE_URL}/funkos/${idFunko}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`,
      },
    });
    if (response.status === 204 || response.status === 200) {
      return { success: true, message: 'Funko eliminado exitosamente.' };
    } else if (response.status === 404) {
      return { success: false, message: 'Funko no encontrado' };
    } else {
      try {
        const errorData = await response.json();
        return { success: false, message: errorData.message || `Error ${response.status}` };
      } catch {
        return { success: false, message: `Error ${response.status}: ${response.statusText}` };
      }
    }
  } catch (error) {
    return { success: false, message: `Error en la solicitud: ${error.message}`};
  }
};

export const eliminarCategoria = async (idCategoria) => {
  try {
    const response = await fetch(`${BASE_URL}/categorias/${idCategoria}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`,
      }
    });
    if (response.status === 204 || response.status === 200) {
      return { success: true, message: 'Categoría eliminada exitosamente.' };
    } else if (response.status === 404) {
      return { success: false, message: 'Categoría no encontrada' };
    } else {
      try {
        const errorData = await response.json();
        return { success: false, message: errorData.message || `Error ${response.status}` };
      } catch {
        return { success: false, message: `Error ${response.status}: ${response.statusText}` };
      }
    }
  } catch (error) {
    return { success: false, message: `Error en la solicitud: ${error.message}` };
  }
};

export const eliminarDescuento = async (idDescuento) => {
  try {
    const response = await fetch(`${BASE_URL}/descuentos/${idDescuento}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`,
      },
    });
    
    if (response.status === 204 || response.status === 200) {
      return { success: true, message: 'Descuento eliminado exitosamente.' };
    } else if (response.status === 404) {
      return { success: false, message: 'Descuento no encontrado' };
    } else {
      try {
        const errorData = await response.json();
        return { success: false, message: errorData.message || `Error ${response.status}` };
      } catch {
        return { success: false, message: `Error ${response.status}: ${response.statusText}` };
      }
    }
  } catch (error) {
    return { success: false, message: `Error en la solicitud: ${error.message}` };
  }
};

export const asignarDescuentoAFunko = async (descuentoData) => {
  try {
    const response = await fetch(`${BASE_URL}/funkodescuentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`,
      },
      body: JSON.stringify(descuentoData),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    return { success: false, message: `Error en la solicitud: ${error.message}` };
  }
};