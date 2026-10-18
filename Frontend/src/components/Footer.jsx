import { Link } from 'react-router-dom';
import { ROUTES } from '../routers/routes';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Marca */}
        <div className="footer-brand">
          <h3>GymManager Pro</h3>
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

          <div className="footer-social">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-tiktok"></i>
            </a>
            <a href="https://wa.me/543815551234" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
