import { useState } from "react";
import { crearCategoria } from "../utils/api";

const CrearCategoria = () => {
  const [categoria, setCategoria] = useState({
    nombre: "",
  });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategoria({
            ...categoria,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await crearCategoria(categoria);

        if (result.success) {
            alert("Categoría creada exitosamente!");
            setCategoria({
                nombre: "",
            });
        } else {
            alert(`Error: ${result.message}`);
        }
    };
    return (
        <div className='crear-container'>
            <h2>Crear Categoría</h2>
            <form className='crear-form' onSubmit={handleSubmit}>
                <div className='form-group'>
                    <label>Nombre:</label>
                    <input type="text" name="nombre" value={categoria.nombre} onChange={handleChange} required />
                </div>
                <button className="btn-crear" type="submit">Crear</button>
            </form>
        </div>
    );
};

export default CrearCategoria;