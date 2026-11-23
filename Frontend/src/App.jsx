import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PagoResultado from './pages/PagoResultado';
import { ROUTES } from './routers/routes';
import Login from './pages/Login';
import RecuperarPassword from './pages/RecuperarPassword';
import RestablecerPassword from './pages/RestablecerPassword';
import Register from './pages/Register';
import VerificarEmail from './pages/VerificarEmail';
import Layout from './components/Layout';
import Home from './pages/Home';
import Contacto from './pages/Contacto';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';
import Perfil from './pages/Perfil';
import Planes from './pages/Planes';
import Membresias from './pages/Membresias';
import HistorialPagos from './pages/HistorialPagos';
import Reservas from './pages/Reservas';
import Actividades from './pages/Actividades';
import Ubicaciones from './pages/Ubicaciones';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Usuarios from './pages/Usuarios';
import ActividadesAdmin from './pages/ActividadesAdmin';
import MensajesAdmin from './pages/MensajesAdmin';
import PlanesAdmin from './pages/PlanesAdmin';
import UbicacionesAdmin from './pages/UbicacionesAdmin';
import Empleado from './pages/Empleado';
import SessionManager from './components/SessionManager';

function App() {
  const loadUser = useAuthStore((state) => state.loadUser);
  const loading = useAuthStore((state) => state.loading);
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return <div>Cargando sesión...</div>; // o un spinner
  }

  return (
    <BrowserRouter>
      <SessionManager />
      <Layout>
        <Routes>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<RecuperarPassword />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<RestablecerPassword />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerificarEmail />} />
          <Route path={ROUTES.PLANES} element={<Planes />} />
          <Route path={ROUTES.CONTACTO} element={<Contacto />} />
          <Route path={ROUTES.PERFIL} element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path={ROUTES.MEMBRESIAS} element={<ProtectedRoute role="socio"><Membresias /></ProtectedRoute>} />
          <Route path={ROUTES.PAGOREXITOSO} element={<PagoResultado />} />
          <Route path={ROUTES.PAGOPENDIENTE} element={<PagoResultado />} />
          <Route path={ROUTES.PAGOFALLIDO} element={<PagoResultado />} />
          <Route path={ROUTES.HISTORIALPAGOS} element={<ProtectedRoute role="socio"><HistorialPagos /></ProtectedRoute>} />
          <Route path={ROUTES.RESERVAS} element={<ProtectedRoute role="socio"><Reservas /></ProtectedRoute>} />
          <Route
            path={ROUTES.CALENDARIO}
            element={<Navigate to={`${ROUTES.ACTIVIDADES}?vista=calendario`} replace />}
          />
          <Route path={ROUTES.ACTIVIDADES} element={<ProtectedRoute role="socio"><Actividades /></ProtectedRoute>} />
          <Route path={ROUTES.UBICACIONES} element={<Ubicaciones />} />
          <Route path={ROUTES.EMPLEADO} element={<ProtectedRoute role="empleado"><Empleado /></ProtectedRoute>} />
          {/* 🔹 Ruta protegida para admin */}
          <Route path={ROUTES.ADMIN} element={<ProtectedRoute role="admin"> <AdminDashboard /></ProtectedRoute>} />
          <Route path={ROUTES.USUARIOS} element={<ProtectedRoute role="admin"> <Usuarios /></ProtectedRoute>} />
          <Route path={ROUTES.ACTIVIDADESADMIN} element={<ProtectedRoute role="admin"> <ActividadesAdmin/></ProtectedRoute>} />
          <Route path={ROUTES.MENSAJES} element={<ProtectedRoute role="admin"> <MensajesAdmin/></ProtectedRoute>} />
          <Route path={ROUTES.PLANESADMIN} element={<ProtectedRoute role="admin"> <PlanesAdmin/></ProtectedRoute>} />
          <Route path={ROUTES.UBICACIONESADMIN} element={<ProtectedRoute role="admin"> <UbicacionesAdmin/></ProtectedRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
