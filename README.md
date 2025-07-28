# 🎉 ImportFunko

**ImportFunko** es un e-commerce moderno y dinámico enfocado en la venta de figuras coleccionables **Funko Pop**. Fue desarrollado como un proyecto full stack utilizando tecnologías actuales como **React**, **Vite**, **Django** y **Django REST Framework**.

🔗 **Sitio en producción**: [https://importfunko.vercel.app/](https://importfunko.vercel.app/)

---

## 🚀 Tecnologías Utilizadas

### Frontend
- ⚛️ [React](https://reactjs.org/) – Librería principal para construir la interfaz.
- ⚡ [Vite](https://vitejs.dev/) – Herramienta de build rápida para desarrollo.
- 🧭 [React Router](https://reactrouter.com/) – Navegación y rutas dinámicas.
- 📦 Context API – Manejo del estado global (auth, carrito, favoritos, etc.).
- 💅 CSS personalizado (con posibilidad de adaptar a Tailwind/SC en el futuro).

### Backend
- 🐍 [Django](https://www.djangoproject.com/) – Framework robusto para el backend.
- 🔗 [Django REST Framework](https://www.django-rest-framework.org/) – Construcción de la API RESTful.
- 🔐 Autenticación con tokens – Para proteger rutas y operaciones sensibles.
- 🛒 Gestión de productos, categorías, usuarios, órdenes, stock, favoritos.

---

## 🧩 Estructura del Proyecto

### Frontend
- `/src/components/`: Componentes reutilizables (Header, Footer, ProductDetail, etc.).
- `/src/pages/`: Páginas principales como Home, Cart, Checkout, Admin.
- `/src/context/`: Contextos de autenticación y lógica global.
- `/src/utils/`: Funciones auxiliares (ej: cálculos de envío).
- Navegación dinámica con rutas como `/product/:id` o `/admin`.

### Backend (repositorio separado)
- `api/`: Contiene los modelos, views, serializers, urls.
- Modelos relacionales: `Product`, `Category`, `Order`, `User`.
- Endpoints REST para todas las operaciones necesarias del negocio.

---

## 🛍️ Funcionalidades Principales

### Para usuarios
- 🔎 Exploración y filtrado de productos.
- 💖 Agregar y quitar productos de favoritos.
- 🛒 Carrito de compras persistente.
- 📍 Cálculo dinámico de envío según ubicación.
- 💳 Checkout funcional y validado.

### Para administradores (staff)
- 📊 Panel protegido en `/admin`.
- 🧾 Operaciones CRUD sobre productos, categorías, usuarios y descuentos.
- 📦 Control de stock y seguimiento de ventas.

---

## 🌐 Despliegue

- 🎯 **Frontend**: [Vercel](https://vercel.com/) → [https://importfunko.vercel.app/](https://importfunko.vercel.app/)
- ⚙️ **Backend**: [Render](https://render.com/) – API desplegada y consumida desde el frontend.
- 🔐 Variables de entorno configuradas para seguridad y escalabilidad.

---

## 📌 Características Adicionales

- 🖼️ Diseño **responsive**, optimizado para móviles y pantallas de escritorio.
- ⚙️ Código modular y mantenible.
- 📦 Manejo eficiente de datos y operaciones seguras con autenticación por token.
- 🔄 Estructura escalable ideal para ampliaciones futuras (pagos, reviews, etc.).

---