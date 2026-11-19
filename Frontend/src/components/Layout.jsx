import Footer from './Footer';
import Navbar from './NavBar';
import '../styles/Layout.css';
import { useAuthStore } from '../store/useAuthStore';
import SidebarSocio from './SidebarSocio';
import SidebarAdmin from './SidebarAdmin';

function Layout({ children }) {
  const { usuario } = useAuthStore();
  const esAdmin = usuario?.rol === 'admin';
  const esSocio = usuario?.rol === 'socio';

  return (
    <div className="layout-container">
      <Navbar />
      <div className={`layout-body${esAdmin ? ' layout-body-admin' : ''}`}>
        {esSocio && <SidebarSocio />}
        {esAdmin && <SidebarAdmin />}
        <main className={`layout-main ${esAdmin ? 'with-admin-sidebar' : esSocio ? 'with-sidebar' : ''}`}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
