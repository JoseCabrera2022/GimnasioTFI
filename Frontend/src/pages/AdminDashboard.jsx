import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { ROUTES } from '../routers/routes';
import { useAuthStore } from '../store/useAuthStore';
import { descargarReporteAdministrativo } from '../utils/reporteAdminPdf';
import '../styles/AdminDashboard.css';

const moneda = (valor) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
}).format(Number(valor) || 0);

const fechaCorta = (valor) => {
  if (!valor) return 'Sin fecha';
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? 'Sin fecha'
    : fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
};

const fechaHora = (valor) => {
  if (!valor) return 'Sin fecha';
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? 'Sin fecha' : fecha.toLocaleString('es-AR');
};

const estadoPago = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
};

function AdminDashboard() {
  const { usuario, token } = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [actualizado, setActualizado] = useState(null);
  const [generandoReporte, setGenerandoReporte] = useState(false);

  const cargarDashboard = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const { data } = await axios.get(ENDPOINTS_LOCAL.DASHBOARD_ADMIN, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboard(data);
      setActualizado(new Date());
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudieron cargar los datos del dashboard.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  const ingresosSemana = useMemo(() => {
    const totales = new Map((dashboard?.ingresosDiarios || []).map((item) => [
      item.fecha,
      Number(item.total) || 0,
    ]));
    const hoy = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - (6 - index));
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
      return {
        clave,
        etiqueta: fecha.toLocaleDateString('es-AR', { weekday: 'short' }),
        total: totales.get(clave) || 0,
      };
    });
  }, [dashboard]);

  const maxIngreso = Math.max(...ingresosSemana.map(({ total }) => total), 1);
  const metricas = dashboard?.metricas;

  const handleDescargarReporte = async () => {
    setGenerandoReporte(true);
    try {
      await descargarReporteAdministrativo(token);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo generar el reporte.');
    } finally {
      setGenerandoReporte(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">FUERZA VITAL · ADMINISTRACIÓN</p>
          <h1>Hola, {usuario?.nombre || 'Admin'}</h1>
          <p className="dashboard-subtitle">
            Resumen de lo que está pasando en tu gimnasio.
            {actualizado && <span> Actualizado {actualizado.toLocaleTimeString('es-AR')}</span>}
          </p>
        </div>
        <div className="dashboard-header-actions">
          <button type="button" className="dashboard-button dashboard-button-light" onClick={cargarDashboard} disabled={cargando}>
            <i className={`fa-solid fa-rotate ${cargando ? 'dashboard-spinning' : ''}`} aria-hidden="true"></i>
            Actualizar
          </button>
          <button type="button" className="dashboard-button dashboard-button-primary" onClick={handleDescargarReporte} disabled={generandoReporte}>
            <i className="fa-solid fa-file-arrow-down" aria-hidden="true"></i>
            {generandoReporte ? 'Generando...' : 'Descargar reporte'}
          </button>
        </div>
      </header>

      {error && (
        <div className="dashboard-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={cargarDashboard}>Reintentar</button>
        </div>
      )}

      <section className="dashboard-metrics" aria-label="Indicadores del gimnasio">
        <article className="dashboard-metric-card metric-blue">
          <div className="metric-icon"><i className="fa-solid fa-users" aria-hidden="true"></i></div>
          <p>Socios activos</p>
          <strong>{cargando ? '—' : metricas?.sociosActivos ?? 0}</strong>
          <span>Con cuenta habilitada</span>
        </article>
        <article className="dashboard-metric-card metric-green">
          <div className="metric-icon"><i className="fa-solid fa-id-card" aria-hidden="true"></i></div>
          <p>Membresías vigentes</p>
          <strong>{cargando ? '—' : metricas?.membresiasActivas ?? 0}</strong>
          <span>Activas y no vencidas</span>
        </article>
        <article className="dashboard-metric-card metric-purple">
          <div className="metric-icon"><i className="fa-solid fa-wallet" aria-hidden="true"></i></div>
          <p>Ingresos del mes</p>
          <strong>{cargando ? '—' : moneda(metricas?.ingresosMes)}</strong>
          <span>{metricas?.pagosMes ?? 0} pagos aprobados</span>
        </article>
        <article className="dashboard-metric-card metric-orange">
          <div className="metric-icon"><i className="fa-solid fa-calendar-check" aria-hidden="true"></i></div>
          <p>Reservas de hoy</p>
          <strong>{cargando ? '—' : metricas?.reservasHoy ?? 0}</strong>
          <span>Turnos confirmados</span>
        </article>
      </section>

      <section className="dashboard-secondary-metrics" aria-label="Resumen de servicios">
        <div><i className="fa-solid fa-dumbbell" aria-hidden="true"></i><strong>{cargando ? '—' : metricas?.planesActivos ?? 0}</strong><span>Planes activos</span></div>
        <div><i className="fa-solid fa-person-running" aria-hidden="true"></i><strong>{cargando ? '—' : metricas?.actividadesActivas ?? 0}</strong><span>Actividades activas</span></div>
        <div><i className="fa-solid fa-location-dot" aria-hidden="true"></i><strong>{cargando ? '—' : metricas?.ubicacionesActivas ?? 0}</strong><span>Sedes activas</span></div>
      </section>

      <section className="dashboard-content-grid">
        <article className="dashboard-panel dashboard-revenue">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Ingresos recientes</h2>
              <p>Pagos aprobados · últimos 7 días</p>
            </div>
            <i className="fa-solid fa-chart-column" aria-hidden="true"></i>
          </div>
          {cargando ? (
            <p className="dashboard-empty">Cargando ingresos...</p>
          ) : (
            <div className="dashboard-chart" aria-label="Gráfico de ingresos diarios">
              {ingresosSemana.map(({ clave, etiqueta, total }) => (
                <div className="dashboard-chart-column" key={clave} title={`${etiqueta}: ${moneda(total)}`}>
                  <span className="dashboard-chart-value">{total > 0 ? moneda(total) : ''}</span>
                  <div className="dashboard-chart-track">
                    <div className="dashboard-chart-bar" style={{ height: `${Math.max((total / maxIngreso) * 100, 4)}%` }}></div>
                  </div>
                  <span className="dashboard-chart-label">{etiqueta}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Próximos turnos</h2>
              <p>Actividades programadas</p>
            </div>
            <Link to={ROUTES.ACTIVIDADESADMIN} className="dashboard-text-link">Ver actividades</Link>
          </div>
          {cargando ? (
            <p className="dashboard-empty">Cargando turnos...</p>
          ) : dashboard?.proximosTurnos?.length ? (
            <div className="dashboard-schedule-list">
              {dashboard.proximosTurnos.map((turno) => (
                <div className="dashboard-schedule-item" key={turno.id}>
                  <div className="dashboard-schedule-date">
                    <strong>{fechaCorta(turno.fecha)}</strong>
                    <span>{new Date(turno.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="dashboard-schedule-info">
                    <strong>{turno.actividad}</strong>
                    <span>{[turno.ubicacion, turno.ciudad].filter(Boolean).join(' · ') || 'Sede no disponible'}</span>
                  </div>
                  <span className="dashboard-capacity">{turno.reservas}/{turno.cupo_maximo}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="dashboard-empty">No hay próximos turnos programados.</p>
          )}
        </article>

        <article className="dashboard-panel dashboard-payments-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Últimos pagos</h2>
              <p>Movimientos recientes de socios</p>
            </div>
            <Link to={ROUTES.HISTORIALPAGOS} className="dashboard-text-link">Ver historial</Link>
          </div>
          {cargando ? (
            <p className="dashboard-empty">Cargando pagos...</p>
          ) : dashboard?.pagosRecientes?.length ? (
            <div className="dashboard-payments-table-wrap">
              <table className="dashboard-payments-table">
                <thead>
                  <tr><th>Socio</th><th>Fecha</th><th>Método</th><th>Estado</th><th>Monto</th></tr>
                </thead>
                <tbody>
                  {dashboard.pagosRecientes.map((pago) => (
                    <tr key={pago.id}>
                      <td>{pago.socio || 'Usuario eliminado'}</td>
                      <td>{fechaHora(pago.fecha)}</td>
                      <td>{pago.metodo_pago || '—'}</td>
                      <td><span className={`dashboard-payment-status status-${pago.estado}`}>{estadoPago[pago.estado] || pago.estado}</span></td>
                      <td>{moneda(pago.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="dashboard-empty">Todavía no hay pagos registrados.</p>
          )}
        </article>
      </section>

      <section className="dashboard-shortcuts">
        <div className="dashboard-shortcuts-heading">
          <div>
            <h2>Accesos rápidos</h2>
            <p>Gestioná las áreas principales desde acá.</p>
          </div>
        </div>
        <div className="dashboard-shortcut-grid">
          <Link to={ROUTES.USUARIOS}><i className="fa-solid fa-users" aria-hidden="true"></i><span><strong>Usuarios</strong><small>Socios y personal</small></span><i className="fa-solid fa-arrow-right" aria-hidden="true"></i></Link>
          <Link to={ROUTES.PLANESADMIN}><i className="fa-solid fa-dumbbell" aria-hidden="true"></i><span><strong>Planes</strong><small>Planes y duraciones</small></span><i className="fa-solid fa-arrow-right" aria-hidden="true"></i></Link>
          <Link to={ROUTES.ACTIVIDADESADMIN}><i className="fa-solid fa-person-running" aria-hidden="true"></i><span><strong>Actividades</strong><small>Clases y turnos</small></span><i className="fa-solid fa-arrow-right" aria-hidden="true"></i></Link>
          <Link to={ROUTES.UBICACIONESADMIN}><i className="fa-solid fa-location-dot" aria-hidden="true"></i><span><strong>Ubicaciones</strong><small>Sedes del gimnasio</small></span><i className="fa-solid fa-arrow-right" aria-hidden="true"></i></Link>
          <Link to={ROUTES.MENSAJES}><i className="fa-solid fa-envelope" aria-hidden="true"></i><span><strong>Mensajes</strong><small>Consultas de contacto</small></span><i className="fa-solid fa-arrow-right" aria-hidden="true"></i></Link>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
