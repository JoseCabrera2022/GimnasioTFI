import Footer from './Footer';
import Navbar from './NavBar';
import '../styles/Layout.css';
import { useAuthStore } from '../store/useAuthStore';
import SidebarSocio from './SidebarSocio';
import SidebarAdmin from './SidebarAdmin';

function Layout({ children }) {
  const { usuario } = useAuthStore();

  return (
    <div className="layout-container">
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
