import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PlanCard from '../components/PlanCard';
import ComparacionModal from '../components/ComparacionModal';
import SessionBanner from '../components/SessionBanner';
import '../styles/Planes.css';
import { useAuthStore } from '../store/useAuthStore';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { ROUTES } from '../routers/routes';

function Planes() {
  const [duracion, setDuracion] = useState('mensual');
  const [mostrarComparacion, setMostrarComparacion] = useState(false);
  const [planes, setPlanes] = useState([]);
  const [duraciones, setDuraciones] = useState([]);
  const [cargandoPlanes, setCargandoPlanes] = useState(true);
  const [errorPlanes, setErrorPlanes] = useState('');
  const [mostrarBanner, setMostrarBanner] = useState(false);
  const [tieneMembresiaActiva, setTieneMembresiaActiva] = useState(false);
  const [membresiaActual, setMembresiaActual] = useState(null);
  const [fechaVencimiento, setFechaVencimiento] = useState(null);
  const [bannerColor, setBannerColor] = useState('');
  const [horaActual, setHoraActual] = useState(new Date());
  const { usuario, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(ENDPOINTS_LOCAL.PLANES, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!Array.isArray(res.data.planes) || !Array.isArray(res.data.duraciones)) {
          throw new Error('La respuesta del servidor no contiene planes y duraciones.');
        }
        setPlanes(res.data.planes);
        setDuraciones(res.data.duraciones);
      } catch (error) {
        console.error('Error al obtener planes:', error);
        setErrorPlanes(error.response?.data?.error || 'No se pudieron cargar los planes.');
      } finally {
        setCargandoPlanes(false);
      }
    };
    fetchData();
  }, [token]);

  // 🔹 Actualizar hora en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMembresias = async () => {
      if (usuario?.rol !== 'socio' || !token) return;
      try {
        const res = await axios.get(ENDPOINTS_LOCAL.MEMBRESIAS, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const membresias = Array.isArray(res.data) ? res.data : [];
        const ahora = new Date();
        const activa = membresias.find((membresia) => (
          membresia.estado === 'activa' && new Date(membresia.fecha_fin) > ahora
        ));

        if (activa) {
          const fechaFin = new Date(activa.fecha_fin);
          const diasRestantes = Math.floor((fechaFin - ahora) / (1000 * 60 * 60 * 24));
          setMembresiaActual(activa);
          setFechaVencimiento(fechaFin);
          setTieneMembresiaActiva(true);
          setBannerColor(diasRestantes <= 7 ? 'amarillo' : 'verde');
          return;
        }

        setMembresiaActual(null);
        setTieneMembresiaActiva(false);
        const ultima = membresias[0];
        const fechaFinUltima = ultima?.fecha_fin ? new Date(ultima.fecha_fin) : null;
        if (fechaFinUltima && fechaFinUltima <= ahora) {
          setFechaVencimiento(fechaFinUltima);
          setBannerColor('rojo');
        } else {
          setFechaVencimiento(null);
          setBannerColor('');
        }
      } catch (error) {
        console.error('Error al obtener membresías:', error);
      }
    };
    fetchMembresias();
  }, [usuario?.rol, token]);

  const obtenerCuentaRegresiva = () => {
    if (!fechaVencimiento) return '';
    const diff = fechaVencimiento - horaActual;
    if (diff <= 0) return "Vencida";

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / (1000 * 60)) % 60);
    const segundos = Math.floor((diff / 1000) % 60);

    return `${dias}d ${horas}h ${minutos}m ${segundos}s`;
  };

  const obtenerIcono = () => {
    if (!fechaVencimiento) return '';
    const diff = fechaVencimiento - horaActual;
    const diasRestantes = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (diff <= 0) return '❌';
    if (diasRestantes <= 7) return '⚠️';
    return '✅';
  };

  const obtenerPrecio = (plan) => {
    const duracionData = duraciones.find(d => d.nombre === duracion);
    if (!duracionData) return 0;
    const base = plan.precio * (duracionData.dias / 30);
    const descuento = duracionData.descuento || 0;
    return Math.round(base * (1 - descuento));
  };

  const obtenerDescuento = (tipoDuracion) => {
    const duracionData = duraciones.find(d => d.nombre === tipoDuracion);
    return duracionData?.descuento ? `${duracionData.descuento * 100}% OFF` : '';
  };

  const generarLink = async (plan) => {
    try {
      const res = await axios.post(ENDPOINTS_LOCAL.PAGOS, {
        plan_id: plan.id,
        duracion,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      window.location.href = res.data.init_point;
    } catch (error) {
      console.error('Error al generar preferencia:', error);
      alert('No se pudo generar el link de pago.');
    }
  };

  return (
    <div className="planes-container">
      {mostrarBanner && <SessionBanner />}

      {bannerColor && (
        <div className={`banner-bloqueo ${bannerColor}`}>
          <span className="banner-icon">{obtenerIcono()}</span>
          <div className="banner-text">
            {bannerColor === 'rojo' ? (
              <span>Tu membresía ya venció</span>
            ) : (
              <span>Ya tienes una membresía activa</span>
            )}
            {fechaVencimiento && (
              <small>
                {bannerColor === 'rojo'
                  ? `Venció el ${fechaVencimiento.toLocaleDateString('es-ES')}`
                  : `Tu membresía vence el ${fechaVencimiento.toLocaleDateString('es-ES')}`}
              </small>
            )}
            <small>⏳ {obtenerCuentaRegresiva()}</small>
          </div>
          <button 
            className="banner-button"
            onClick={() => navigate(ROUTES.MEMBRESIAS)}
          >
            Ver mis membresías
          </button>
        </div>
      )}

      <button className="btn-comparar" onClick={() => setMostrarComparacion(true)}>
        Comparar planes
      </button>

      <div className="duracion-barra">
        {['mensual', 'trimestral', 'anual'].map((tipo) => (
          <button
            key={tipo}
            className={`duracion-opcion ${duracion === tipo ? 'activo' : ''}`}
            onClick={() => setDuracion(tipo)}
            disabled={duracion === tipo}
          >
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}{" "}
            <span className="descuento">{obtenerDescuento(tipo)}</span>
          </button>
        ))}
        <div className={`duracion-slider ${duracion}`}></div>
      </div>

      {cargandoPlanes && <p>Cargando planes...</p>}
      {errorPlanes && <p role="alert">{errorPlanes}</p>}
      {!cargandoPlanes && !errorPlanes && planes.length === 0 && (
        <p>No hay planes disponibles.</p>
      )}

      <div className="tarjetas-planes">
        {planes.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            duracion={duracion}
            obtenerPrecio={obtenerPrecio}
            generarLink={generarLink}
            setMostrarBanner={setMostrarBanner}
            tieneMembresiaActiva={tieneMembresiaActiva}
            membresiaActual={membresiaActual}
            bannerColor={bannerColor}
            fechaVencimiento={fechaVencimiento}
          />
        ))}
      </div>

      {mostrarComparacion && (
        <ComparacionModal
          planes={planes}
          duraciones={duraciones}
          onClose={() => setMostrarComparacion(false)}
        />
      )}
    </div>
  );
}

export default Planes;
