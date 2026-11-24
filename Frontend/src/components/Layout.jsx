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
  const esAdmin = usuario?.rol === 'admin';
  const esSocio = usuario?.rol === 'socio';
  const esEmpleado = usuario?.rol === 'empleado';
  const hasBackgroundImage = [
    ROUTES.PLANES,
    ROUTES.CONTACTO,
    ROUTES.UBICACIONES,
    ROUTES.LOGIN,
    ROUTES.REGISTER
  ].includes(pathname);

  return (
    <div className={`layout-container${hasBackgroundImage ? ' has-background-image' : ''}`}>
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
