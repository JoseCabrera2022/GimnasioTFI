# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Conectar el frontend con el backend

Por defecto, el frontend usa `http://localhost:8000`. Para abrirlo mediante ngrok,
configura `VITE_API_URL` con la URL pública del túnel que expone el **backend**
(el que reenvía al puerto 8000), no con la URL del túnel del frontend.

Crea `Frontend/.env.local` con:

```env
VITE_API_URL=https://tu-dominio-del-backend.ngrok-free.dev
```

Reinicia Vite después de cambiar esta variable. Si la URL pública del túnel del
backend cambia, actualiza el valor y vuelve a reiniciarlo.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
