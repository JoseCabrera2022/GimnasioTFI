import { useAuthStore } from '../store/useAuthStore';

function PlanCard({ plan, obtenerPrecio, generarLink, setMostrarBanner, tieneMembresiaActiva }) {
  const esPremium = plan.tipo === 'premium';
  const beneficios = plan.descripcion?.split(',').map(b => b.trim()) || [];
  const { usuario, sessionExpired } = useAuthStore();

  const handleClick = () => {
    if (!usuario || sessionExpired) {
      setMostrarBanner(true);
      return;
    }
    if (tieneMembresiaActiva) {
      return; // 🔹 bloquea acción si hay membresía activa
    }
    generarLink(plan);
  };

  return (
    <div className={`tarjeta ${esPremium ? 'destacada' : ''}`}>
      {esPremium && <div className="insignia-premium">⭐ Mejor opción</div>}
      <h3 className="titulo-plan">{plan.nombre}</h3>
      <p className="precio">${obtenerPrecio(plan)}</p>
      <ul>
        {beneficios.map((b, i) => <li key={i}>{b}</li>)}
      </ul>

      {tieneMembresiaActiva ? (
        <div className="bloqueo-membresia">
          ⚠️ Ya tienes una membresía activa<br />
          <small>Debes esperar a que venza para comprar otro plan.</small>
        </div>
      ) : (
        <button
          className={`btn-pagar ${esPremium ? 'btn-destacada' : ''}`}
          onClick={handleClick}
        >
          {esPremium ? '¡Mejor opción!' : 'Elige este plan'}
        </button>
      )}
    </div>
  );
}

export default PlanCard;
