import { ROUTES } from '../routers/routes';
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import Planes from './Planes';
import Ubicaciones from './Ubicaciones';
import Contacto from './Contacto';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* 🔹 Hero Banner */}
      <section className="hero-banner">
        <div className="hero-overlay">
          <span className="hero-eyebrow">Tu fuerza empieza aquí</span>
          <h1>Transformá tu cuerpo.<br /><strong>Superá tus límites.</strong></h1>
          <p>Entrenamientos pensados para vos, instalaciones modernas y un equipo que te acompaña en cada objetivo.</p>
          <button onClick={() => navigate(ROUTES.LOGIN)} className="hero-button">
            Comenzar ahora <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </section>

      {/* 🔹 Instalaciones */}
      <section className="home-section instalaciones">
        <div className="section-heading">
          <span className="section-kicker">Nuestras instalaciones</span>
          <h2>Espacios para todos tus objetivos</h2>
        </div>
        <div className="gallery">
          <img src="/assets/gym.jpg" alt="Sala de pesas" />
          <img src="/assets/gym2.jpg" alt="Zona cardio" />
          <img src="/assets/gym3.jpg" alt="Área funcional" />
          <img src="/assets/gym4.jpg" alt="Área relax" />
        </div>
      </section>

      {/* 🔹 Entrenadores */}
      <section className="home-section entrenadores dark-section">
        <div className="section-heading section-heading-light">
          <span className="section-kicker">Nuestro equipo</span>
          <h2>Conocé a nuestros entrenadores</h2>
        </div>
        <div className="carousel">
          <div className="carousel-item">
            <img src="/assets/trainer1.jpg" alt="Entrenador 1" />
            <p>Juan Pérez - Especialista en fuerza</p>
          </div>
          <div className="carousel-item">
            <img src="/assets/trainer2.jpg" alt="Entrenador 2" />
            <p>María López - Coach de cardio</p>
          </div>
          <div className="carousel-item">
            <img src="/assets/trainer3.jpg" alt="Entrenador 3" />
            <p>Carlos Gómez - Funcional y HIIT</p>
          </div>
        </div>
      </section>

      {/* 🔹 Planes */}
      <section className="home-section planes-section">
        <div className="section-heading">
          <span className="section-kicker">Planes</span>
          <h2>Elegí tu entrenamiento</h2>
          <p>Encontrá el plan que mejor se adapte a tus objetivos.</p>
        </div>
        <Planes/>
      </section>

      {/* 🔹 Ubicaciones */}
      <section className="home-section ubicaciones-section">
        <div className="section-heading">
          <span className="section-kicker">Nuestras sedes</span>
          <h2>Entrená cerca de vos</h2>
          <p>Encontrá tu gimnasio más cercano y accedé a todas nuestras instalaciones.</p>
        </div>
        <Ubicaciones/>
      </section>

      {/* 🔹 Contacto */}
      <section className="home-section contacto-section">
        <div className="section-heading">
          <span className="section-kicker">Contacto</span>
          <h2>¿Tenés alguna consulta?</h2>
          <p>Escribinos y te ayudaremos en lo que necesites.</p>
        </div>
        <Contacto/>
      </section>
    </div>
  );
}

export default Home;
