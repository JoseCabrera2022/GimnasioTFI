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
          <h1>GymManager Pro 🏋️‍♂️</h1>
          <p>"Tu esfuerzo, nuestra guía. Juntos alcanzamos tus metas 💪"</p>
          <button onClick={() => navigate(ROUTES.LOGIN)} className="hero-button">
            Comenzar ahora
          </button>
        </div>
      </section>

      {/* 🔹 Instalaciones */}
      <section className="home-section instalaciones">
        <h2>Nuestras instalaciones</h2>
        <div className="gallery">
          <img src="/assets/gym.jpg" alt="Sala de pesas" />
          <img src="/assets/gym2.jpg" alt="Zona cardio" />
          <img src="/assets/gym3.jpg" alt="Área funcional" />
          <img src="/assets/gym4.jpg" alt="Área relax" />
        </div>
      </section>

      {/* 🔹 Entrenadores */}
      <section className="home-section entrenadores">
        <h2>Conoce a nuestros entrenadores</h2>
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
      <section className="home-section">
        <h2>Planes de entrenamiento</h2>
        <p>Descubre nuestros planes y elige el que mejor se adapte a ti.</p>
        <Planes/>
      </section>

      {/* 🔹 Ubicaciones */}
      <section className="home-section">
        <h2>Nuestras sedes</h2>
        <p>Encuentra tu gimnasio más cercano y accede a todas nuestras instalaciones.</p>
        <Ubicaciones/>
      </section>

      {/* 🔹 Contacto */}
      <section className="home-section">
        <h2>Contacto</h2>
        <p>¿Tienes dudas? Escríbenos y te ayudaremos en lo que necesites.</p>
        <Contacto/>
      </section>
    </div>
  );
}

export default Home;
