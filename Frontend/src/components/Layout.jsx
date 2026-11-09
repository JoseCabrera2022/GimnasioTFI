import Footer from './Footer';
import Navbar from './NavBar';
import '../styles/Layout.css';
import { useAuthStore } from '../store/useAuthStore';
import SidebarSocio from './SidebarSocio';
import SidebarAdmin from './SidebarAdmin';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../routers/routes';

function Layout({ children }) {
  const { usuario } = useAuthStore();
  const { pathname } = useLocation();
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
      <div className="layout-body">
        {usuario?.rol === 'socio' && <SidebarSocio />}
        {usuario?.rol === 'admin' && <SidebarAdmin />}
        <main className={`layout-main ${usuario?.rol === 'socio' || usuario?.rol === 'admin' ? 'with-sidebar' : ''}`}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
