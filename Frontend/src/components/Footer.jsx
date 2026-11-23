import { Link } from 'react-router-dom';
import { ROUTES } from '../routers/routes';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/Footer.css';

const REDES_SOCIALES = [
  { nombre: 'Facebook', icono: 'fa-facebook-f', url: 'https://www.facebook.com' },
  { nombre: 'Instagram', icono: 'fa-instagram', url: 'https://www.instagram.com' },
  { nombre: 'X', icono: 'fa-twitter', url: 'https://x.com' },
  { nombre: 'YouTube', icono: 'fa-youtube', url: 'https://www.youtube.com' },
  { nombre: 'LinkedIn', icono: 'fa-linkedin-in', url: 'https://www.linkedin.com' },
  { nombre: 'TikTok', icono: 'fa-tiktok', url: 'https://www.tiktok.com' },
  { nombre: 'WhatsApp', icono: 'fa-whatsapp', url: 'https://wa.me/543815551234' },
];

function EnlacesRedesSociales() {
  return (
    <div className="footer-social" aria-label="Redes sociales">
      {REDES_SOCIALES.map(({ nombre, icono, url }) => (
        <a
          href={url}
          key={nombre}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={nombre}
        >
          <i className={`fab ${icono}`} aria-hidden="true"></i>
        </a>
      ))}
    </div>
  );
}

function Footer() {
  const usuario = useAuthStore((state) => state.usuario);
  const esAdmin = usuario?.rol === 'admin';
  const esSocio = usuario?.rol === 'socio';

  if (esAdmin) {
    return (
      <footer className="footer footer-admin">
        <div className="footer-content footer-admin-content">
          <p>Fuerza Vital</p>
          <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
          <EnlacesRedesSociales />
        </div>
      </footer>
    );
  }

  if (esSocio) {
    return (
      <footer className="footer footer-member">
        <div className="footer-content footer-member-content">
          <div className="footer-brand">
            <h3>Fuerza Vital</h3>
            <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
          </div>
          <nav className="footer-links" aria-label="Enlaces de información">
            <Link to={ROUTES.UBICACIONES}>Sedes</Link>
            <Link to={ROUTES.CONTACTO}>Contacto</Link>
          </nav>
          <EnlacesRedesSociales />
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Marca */}
        <div className="footer-brand">
          <h3>Fuerza Vital</h3>
          <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>

        {/* Links rápidos */}
        <div className="footer-links">
          <Link to={ROUTES.HOME}>Inicio</Link>
          <Link to={ROUTES.PLANES}>Planes</Link>
          <Link to={ROUTES.CONTACTO}>Contacto</Link>
          <Link to={ROUTES.UBICACIONES}>Ubicación</Link>
        </div>

        {/* Contacto + Redes sociales */}
        <div className="footer-contact">
          <p><i className="fas fa-phone"></i> +54 381 555-1234</p>
          <p><i className="fas fa-envelope"></i> contacto@atlasgym.com</p>
          <p><i className="fas fa-map-marker-alt"></i> Reconquista 460, Banda del Río Salí</p>
          <EnlacesRedesSociales />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
