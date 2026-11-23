import { useAuthStore } from '../store/useAuthStore';
import { capitalizarPrimeraLetra } from '../utils/conversiones';

function PlanCard({
  plan,
  duracion,
  obtenerPrecio,
  generarLink,
  setMostrarBanner,
  tieneMembresiaActiva,
  membresiaActual,
}) {
  const esPremium = plan.tipo === 'premium';
  const esPlanActual = Number(membresiaActual?.plan_id) === Number(plan.id);
  const beneficios = plan.descripcion?.split(',').map(b => b.trim()) || [];
  const { usuario, sessionExpired } = useAuthStore();
  const puedeComprar = usuario?.rol === 'socio';

  const handleClick = () => {
    if (!usuario || sessionExpired) {
      setMostrarBanner(true);
      return;
    }
    if (!puedeComprar) return;
    if (tieneMembresiaActiva) {
      return; // 🔹 bloquea acción si hay membresía activa
    }
    generarLink(plan);
  };

  return (
    <article className={`tarjeta ${esPremium ? 'destacada' : ''} ${esPlanActual ? 'plan-actual' : ''} ${tieneMembresiaActiva && !esPlanActual ? 'plan-bloqueado' : ''}`}>
      {esPlanActual ? (
        <div className="insignia-plan-actual">
          <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
          Plan actual
        </div>
      ) : esPremium ? (
        <div className="insignia-premium">⭐ Mejor opción</div>
      ) : null}

      <div className="plan-card-contenido">
        <p className="plan-tipo">{esPremium ? 'Experiencia premium' : 'Plan de entrenamiento'}</p>
        <h3 className="titulo-plan">{plan.nombre}</h3>
        <div className="plan-precio">
          <p className="precio">${Number(obtenerPrecio(plan)).toLocaleString('es-AR')}</p>
          <span>por {capitalizarPrimeraLetra(duracion)}</span>
        </div>
        <ul className="plan-beneficios">
          {beneficios.map((beneficio, i) => (
            <li key={`${beneficio}-${i}`}>
              <i className="fa-solid fa-check" aria-hidden="true"></i>
              <span>{beneficio}</span>
            </li>
          ))}
        </ul>
      </div>

      {esPlanActual ? (
        <div className="plan-card-estado vigente">
          <strong>Tu membresía está activa</strong>
          <span>
            Vigente hasta {new Date(membresiaActual.fecha_fin).toLocaleDateString('es-AR')}
          </span>
        </div>
      ) : tieneMembresiaActiva ? (
        <div className="plan-card-estado bloqueado">
          <strong>Ya tienes un plan vigente</strong>
          <span>Podrás elegir otro cuando finalice.</span>
        </div>
      ) : usuario && !puedeComprar ? (
        <div className="plan-card-estado bloqueado">
          <strong>Compra disponible para socios</strong>
        </div>
      ) : (
        <button
          type="button"
          className={`btn-pagar ${esPremium ? 'btn-destacada' : ''}`}
          onClick={handleClick}
        >
          Elegir este plan
          <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </button>
      )}
    </article>
  );
}

export default PlanCard;
