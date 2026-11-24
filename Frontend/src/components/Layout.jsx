import Footer from './Footer';
import Navbar from './NavBar';
import '../styles/Layout.css';
import { useAuthStore } from '../store/useAuthStore';
import SidebarSocio from './SidebarSocio';
import SidebarAdmin from './SidebarAdmin';
import SidebarEmpleado from './SidebarEmpleado';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../routers/routes';

function Layout({ children }) {
  const { usuario } = useAuthStore();
  const { pathname } = useLocation();

  // Lógica de roles - del Código 1 (se mantiene igual)
  const esAdmin = usuario?.rol === 'admin';
  const esSocio = usuario?.rol === 'socio';
  const esEmpleado = usuario?.rol === 'empleado';

  // Lógica de fondos por ruta - del Código 2
  const isLogin = pathname === ROUTES.LOGIN;
  const isRegister = pathname === ROUTES.REGISTER;
  const isPasswordRecovery = pathname === ROUTES.FORGOT_PASSWORD;
  const isContact = pathname === ROUTES.CONTACTO;
  const isLocations = pathname === ROUTES.UBICACIONES;

  const hasBackgroundImage = [
    ROUTES.PLANES,
    ROUTES.CONTACTO,
    ROUTES.UBICACIONES,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD
  ].includes(pathname);

  return (
    <div className={`layout-container${hasBackgroundImage ? ' has-background-image' : ''}${isLogin ? ' has-login-background' : ''}${isRegister ? ' has-register-background' : ''}${isPasswordRecovery ? ' has-password-recovery-background' : ''}${isContact ? ' has-contact-background' : ''}${isLocations ? ' has-locations-background' : ''}`}>
      <Navbar />
      <div className={`layout-body${esAdmin || esEmpleado ? ' layout-body-admin' : ''}${esSocio ? ' layout-body-socio' : ''}`}>
        {esSocio && <SidebarSocio />}
        {esAdmin && <SidebarAdmin />}
        {esEmpleado && <SidebarEmpleado />}
        <main className={`layout-main ${esAdmin || esEmpleado ? 'with-admin-sidebar' : esSocio ? 'with-sidebar' : ''}`}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;