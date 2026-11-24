import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routers/routes';
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import http from '../utils/axiosConfig';
import Planes from './Planes';
import Ubicaciones from './Ubicaciones';
import Contacto from './Contacto';

const formatearFecha = (valor, opciones = {}) => {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? 'Fecha no disponible'
    : fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...opciones,
    });
};

function InicioSocio() {
  const { usuario, token } = useAuthStore();
  const [membresias, setMembresias] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState([]);

  useEffect(() => {
    let activo = true;

    const cargarResumen = async () => {
      if (!token) {
        setCargando(false);
        setErrores(['No se pudo validar la sesión. Inicia sesión nuevamente.']);
        return;
      }

      const resultados = await Promise.allSettled([
        http.get(ENDPOINTS_LOCAL.MEMBRESIAS, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        http.get(ENDPOINTS_LOCAL.RESERVAS, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!activo) return;

      const nuevosErrores = [];
      if (resultados[0].status === 'fulfilled') {
        setMembresias(Array.isArray(resultados[0].value.data) ? resultados[0].value.data : []);
      } else {
        nuevosErrores.push('No se pudo cargar la información de tu membresía.');
      }

      if (resultados[1].status === 'fulfilled') {
        setReservas(Array.isArray(resultados[1].value.data) ? resultados[1].value.data : []);
      } else {
        nuevosErrores.push('No se pudieron cargar tus próximas reservas.');
      }

      setErrores(nuevosErrores);
      setCargando(false);
    };

    cargarResumen();
    return () => {
      activo = false;
    };
  }, [token]);

  const ahora = new Date();
  const membresiaActiva = membresias.find((membresia) =>
    membresia.estado === 'activa'
    && new Date(membresia.fecha_fin).getTime() > ahora.getTime()
  );
  const ultimaMembresia = membresiaActiva || membresias[0];
  const reservasProximas = reservas
    .filter((reserva) =>
      reserva.estado === 'confirmada'
      && new Date(reserva.fecha).getTime() >= ahora.getTime()
    )
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  const proximaReserva = reservasProximas[0];
  const nombre = usuario?.nombre?.trim().split(/\s+/)[0] || 'socio';

  return (
    <div className="member-home">
      <header className="member-home-hero">
        <div className="member-home-welcome">
          <span className="member-home-eyebrow">TU ESPACIO DE ENTRENAMIENTO</span>
          <h1>Hola, {nombre}</h1>
          <p>Organizá tus entrenamientos y tené tu cuenta al día.</p>
        </div>
        <Link to={ROUTES.ACTIVIDADES} className="member-home-primary">
          <i className="fa-solid fa-dumbbell" aria-hidden="true"></i>
          Reservar actividad
        </Link>
      </header>

      {errores.length > 0 && (
        <div className="member-home-error" role="alert">
          {errores.map((error) => <p key={error}>{error}</p>)}
        </div>
      )}

      <section className="member-home-summary" aria-label="Resumen de tu cuenta">
        <article className="member-summary-card">
          <div className="member-summary-icon member-icon-membership">
            <i className="fa-solid fa-id-card" aria-hidden="true"></i>
          </div>
          <div className="member-summary-content">
            <span>Mi membresía</span>
            {cargando ? (
              <strong className="member-summary-muted">Cargando...</strong>
            ) : ultimaMembresia ? (
              <>
                <strong>{ultimaMembresia.plan || 'Plan contratado'}</strong>
                <small>
                  {membresiaActiva
                    ? `Activa hasta ${formatearFecha(membresiaActiva.fecha_fin)}`
                    : `Estado: ${ultimaMembresia.estado || 'Sin estado'}`}
                </small>
              </>
            ) : (
              <>
                <strong>Sin membresía activa</strong>
                <small>Elegí un plan para empezar a entrenar.</small>
              </>
            )}
          </div>
          <Link to={ROUTES.MEMBRESIAS} className="member-summary-link">
            Ver detalle
          </Link>
        </article>

        <article className="member-summary-card">
          <div className="member-summary-icon member-icon-reservations">
            <i className="fa-solid fa-calendar-check" aria-hidden="true"></i>
          </div>
          <div className="member-summary-content">
            <span>Próxima reserva</span>
            {cargando ? (
              <strong className="member-summary-muted">Cargando...</strong>
            ) : proximaReserva ? (
              <>
                <strong>{proximaReserva.actividad}</strong>
                <small>
                  {formatearFecha(proximaReserva.fecha, {
                    hour: '2-digit',
                    minute: '2-digit',
                    hourCycle: 'h23',
                  })}
                </small>
              </>
            ) : (
              <>
                <strong>Sin reservas próximas</strong>
                <small>Consultá las actividades y horarios disponibles.</small>
              </>
            )}
          </div>
          <Link to={ROUTES.RESERVAS} className="member-summary-link">
            Mis reservas
          </Link>
        </article>
      </section>

      <section className="member-home-section">
        <div className="member-home-section-heading">
          <div>
            <span className="member-home-eyebrow">ACCESOS RÁPIDOS</span>
            <h2>¿Qué querés hacer hoy?</h2>
          </div>
        </div>
        <div className="member-quick-links">
          <Link to={ROUTES.ACTIVIDADES} className="member-quick-card">
            <span className="member-quick-icon"><i className="fa-solid fa-dumbbell" aria-hidden="true"></i></span>
            <span><strong>Reservar actividad</strong><small>Encontrá un horario para entrenar.</small></span>
            <i className="fa-solid fa-arrow-right member-quick-arrow" aria-hidden="true"></i>
          </Link>
          <Link to={`${ROUTES.ACTIVIDADES}?vista=calendario`} className="member-quick-card">
            <span className="member-quick-icon"><i className="fa-solid fa-calendar-days" aria-hidden="true"></i></span>
            <span><strong>Ver calendario</strong><small>Explorá las actividades de la semana.</small></span>
            <i className="fa-solid fa-arrow-right member-quick-arrow" aria-hidden="true"></i>
          </Link>
          <Link to={ROUTES.HISTORIALPAGOS} className="member-quick-card">
            <span className="member-quick-icon"><i className="fa-solid fa-receipt" aria-hidden="true"></i></span>
            <span><strong>Consultar pagos</strong><small>Revisá tus comprobantes y movimientos.</small></span>
            <i className="fa-solid fa-arrow-right member-quick-arrow" aria-hidden="true"></i>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);

  if (usuario?.rol === 'socio') {
    return <InicioSocio />;
  }

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
      <section className="home-section dark-section ubicaciones-section">
        <div className="section-heading section-heading-light">
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
