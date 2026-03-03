# Portal de Avisos Ciudadanos 📢

Un sistema web rápido, moderno y seguro para la publicación, gestión y lectura de notificaciones cívicas. Diseñado para mantener informados a los usuarios en tiempo real, con una administración flexible y una interfaz centrada en la experiencia del usuario.

## 🌟 Funcionalidades Principales

### Para los Usuarios Cívicos (Lectores)
- **Visualización en Tiempo Real**: Feed de noticias y avisos ciudadanos de carga rápida.
- **Sistema de Comentarios Interactivo**: Soporta textos enriquecidos e incluso **subida de fotos** directamente en los comentarios de cada aviso.
- **Edición y Control de Comentarios**: Los usuarios pueden corregir o borrar sus propios comentarios fácilmente, brindando una experiencia más orgánica.
- **Sistema de Alertas**: Notificaciones tipo *Toast* para mantenerte informado del estado de tus solicitudes y accesos.
- **Modo Oscuro / Claro**: *(Soportado mediante Tailwind)* Interfaz amigable, limpia y responsiva adaptada para móviles, tablets y escritorios.

### Para el Equipo Administrativo (Gestión)
- **Acceso Administrativo Oculto**: Sistema de Login por credenciales protegido mediante Firebase Auth para creadores y moderadores.
- **Editor CMS Basado en Bloques**: En lugar de un inmenso cuadro de texto, los avisos se crean armando "bloques" dinámicos (Párrafos e Imágenes). Se pueden ordenar (subir/bajar) y eliminar individualmente para diseñar artículos visualmente atractivos.
- **🖼️ Compresión Automática de Imágenes**: Subida inteligente que redimensiona y comprime fotos pesadas en el propio navegador (usando Canvas) antes de subirlas al servidor, lo que ahorra almacenamiento y acelera los tiempos de carga.
- **🤖 Asistente de IA (Gemini)**: Integración segura con Google Gemini Pro para rescribir o enriquecer los textos redactados de cualquier bloque de manera automática (pasando por un Proxy en Vercel para ocultar las claves maestras).
- **Personalización Visual Activa**: El favicon y el logotipo del portal se pueden administrar directamente desde un clic, afectando el branding del sitio al instante.
- **Modo Mantenimiento**: Interruptor "Kill Switch" que permite bloquear el acceso temporalmente a toda la plataforma durante actualizaciones mayores.
- **Moderación Rápida**: Control total y privilegios exclusivos para borrar artículos obsoletos y moderar todo el contenido de la plataforma de forma instantánea.

## 🛠️ Stack Tecnológico

La plataforma fue diseñada con rendimiento, seguridad y experiencia del desarrollador en mente:

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) - Renderizado veloz, sintaxis clara y hot-reloading optimizado.
- **Estilizado**: [Tailwind CSS 3.4](https://tailwindcss.com/) - Diseño de utilidad moderno complementado con componentes minimalistas y amigables.
- **Iconografía**: [Lucide React](https://lucide.dev/) - Set consistente, nítido y altamente personalizable de íconos.
- **Backend as a Service (BaaS)**: [Firebase](https://firebase.google.com/) 
  - **Firestore**: Base de datos NoSQL reactiva para artículos y comentarios en tiempo real.
  - **Cloud Storage**: Almacenamiento seguro en la nube para banners corporativos e imágenes de usuarios.
  - **Firebase Auth**: Verificación de identidades estricta y segura.
- **Inteligencia Artificial**: API Módulo de `@google/generative-ai` (Gemini Pro).

## 🚀 Instalación y Desarrollo Local

¿Quieres probar el panel o contribuir al desarrollo? Sigue estos breves pasos.

1. **Clona el repositorio** o asegúrate de estar dentro del directorio base:
   ```bash
   cd noticiero-app
   ```

2. **Instala las Dependencias** de Node.js:
   ```bash
   npm install
   ```

3. **Configura tus variables de entorno (Opcional, pero necesario para el BaaS local)**.
   *Debes crear un archivo `.env` en la raíz (usa `.env.example` si lo hubiera)* e incluir las credenciales correspondientes a tu propio entorno de Firebase y Google Gemini.

4. **Inicia el Servidor de Desarrollo**:
   ```bash
   npm run dev
   ```

5. **Abre el proyecto** en [http://localhost:5173](http://localhost:5173).

## 📄 Términos y Condiciones
El portal cuenta con un módulo que fuerza a la primera aceptación estructural de normativas para un mejor comportamiento cívico y orden interno, el cual forma parte indispensable del acceso seguro.
