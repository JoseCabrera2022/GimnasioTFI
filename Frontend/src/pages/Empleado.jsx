import { useCallback, useEffect, useMemo, useState } from 'react';
import http from '../utils/axiosConfig';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/Empleado.css';

const TURNOS_VACIOS = [];

const formatearHora = (valor) => new Date(valor).toLocaleTimeString('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const formatearFechaTurno = (valor) => new Date(valor).toLocaleDateString('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const claveFechaTurno = (valor) => {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '';
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
};

const formatearFecha = (valor) => valor
  ? new Date(valor).toLocaleDateString('es-AR')
  : 'Sin membresía vigente';

function Empleado() {
  const token = useAuthStore((state) => state.token);
  const usuario = useAuthStore((state) => state.usuario);
  const [resumen, setResumen] = useState(null);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoReservas, setCargandoReservas] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('success');
  const [busqueda, setBusqueda] = useState('');
  const [socios, setSocios] = useState([]);
  const [buscandoSocios, setBuscandoSocios] = useState(false);
  const [ingresoEnCurso, setIngresoEnCurso] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [buscandoSugerencias, setBuscandoSugerencias] = useState(false);
  const [errorSugerencias, setErrorSugerencias] = useState('');
  const [sugerenciasAbiertas, setSugerenciasAbiertas] = useState(false);
  const [consultarSugerencias, setConsultarSugerencias] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [filtroReservasTurnos, setFiltroReservasTurnos] = useState('con_reservas');
  const [fechaFiltroTurnos, setFechaFiltroTurnos] = useState('');
  const [actividadFiltroTurnos, setActividadFiltroTurnos] = useState('');
  const [cantidadTurnosVisibles, setCantidadTurnosVisibles] = useState(5);

  const cargarResumen = useCallback(async (silencioso = false) => {
    if (!silencioso) {
      setCargando(true);
      setError('');
    }
    try {
      const { data } = await http.get(ENDPOINTS_LOCAL.EMPLEADO_RESUMEN, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumen(data);
      return data;
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo cargar la agenda de hoy.');
      return null;
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  useEffect(() => {
    const termino = busqueda.trim();
    if (!consultarSugerencias || termino.length < 2) {
      setSugerencias([]);
      setBuscandoSugerencias(false);
      setErrorSugerencias('');
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setBuscandoSugerencias(true);
      setErrorSugerencias('');
      try {
        const { data } = await http.get(ENDPOINTS_LOCAL.EMPLEADO_SOCIOS, {
          params: { q: termino },
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        setSugerencias(data);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setSugerencias([]);
          setErrorSugerencias(requestError.response?.data?.error || 'No se pudieron cargar las sugerencias.');
        }
      } finally {
        if (!controller.signal.aborted) setBuscandoSugerencias(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [busqueda, consultarSugerencias, token]);

  const abrirTurno = useCallback(async (turnoId, silencioso = false) => {
    setTurnoSeleccionado(turnoId);
    if (!silencioso) {
      setCargandoReservas(true);
      setMensaje('');
    }
    try {
      const { data } = await http.get(
        `${ENDPOINTS_LOCAL.EMPLEADO_TURNOS}/${turnoId}/reservas`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReservas(data);
    } catch (requestError) {
      setReservas([]);
      setTipoMensaje('error');
      setMensaje(requestError.response?.data?.error || 'No se pudo cargar la lista del turno.');
    } finally {
      if (!silencioso) setCargandoReservas(false);
    }
  }, [token]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      cargarResumen(true);
      if (turnoSeleccionado) abrirTurno(turnoSeleccionado, true);
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, [cargarResumen, abrirTurno, turnoSeleccionado]);

  const buscarSocios = async (event) => {
    event.preventDefault();
    setSugerenciasAbiertas(false);
    setConsultarSugerencias(false);
    setBusquedaRealizada(true);
    if (busqueda.trim().length < 2) {
      setTipoMensaje('error');
      setMensaje('Escribe al menos dos caracteres para buscar un socio.');
      return;
    }

    setBuscandoSocios(true);
    setMensaje('');
    try {
      const { data } = await http.get(ENDPOINTS_LOCAL.EMPLEADO_SOCIOS, {
        params: { q: busqueda.trim() },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSocios(data);
    } catch (requestError) {
      setTipoMensaje('error');
      setMensaje(requestError.response?.data?.error || 'No se pudo completar la búsqueda.');
    } finally {
      setBuscandoSocios(false);
    }
  };

  const seleccionarSugerencia = (socio) => {
    setBusqueda(socio.nombre);
    setSocios([socio]);
    setBusquedaRealizada(true);
    setMensaje('');
    setSugerencias([]);
    setSugerenciasAbiertas(false);
    setConsultarSugerencias(false);
  };

  const registrarIngresoLibre = async (socio) => {
    setIngresoEnCurso(socio.id);
    setMensaje('');
    try {
      await http.post(
        ENDPOINTS_LOCAL.EMPLEADO_INGRESOS,
        { socio_id: socio.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTipoMensaje('success');
      setMensaje(`Ingreso libre registrado para ${socio.nombre}.`);
      setSocios((actuales) => actuales.map((actual) => (
        actual.id === socio.id ? { ...actual, ingreso_registrado: true } : actual
      )));
    } catch (requestError) {
      setTipoMensaje('error');
      setMensaje(requestError.response?.data?.error || 'No se pudo registrar el ingreso.');
    } finally {
      setIngresoEnCurso(null);
    }
  };

  const registrarAsistencia = async (reservaId) => {
    setMensaje('');
    try {
      await http.post(
        `${ENDPOINTS_LOCAL.EMPLEADO_ASISTENCIAS}/${reservaId}/asistencia`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTipoMensaje('success');
      setMensaje('Asistencia registrada.');
      await Promise.all([abrirTurno(turnoSeleccionado), cargarResumen()]);
    } catch (requestError) {
      setTipoMensaje('error');
      setMensaje(requestError.response?.data?.error || 'No se pudo registrar la asistencia.');
    }
  };

  const turnos = resumen?.turnos || [];
  const turnosFuturos = resumen?.turnosFuturos || TURNOS_VACIOS;
  const fechasTurnosFuturos = useMemo(() => (
    [...new Set(turnosFuturos.map((turno) => claveFechaTurno(turno.fecha)).filter(Boolean))].sort()
  ), [turnosFuturos]);
  const actividadesTurnosFuturos = useMemo(() => (
    [...new Set(turnosFuturos.map((turno) => turno.actividad).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'es'))
  ), [turnosFuturos]);
  const turnosFuturosFiltrados = turnosFuturos.filter((turno) => (
    (filtroReservasTurnos === 'todos'
      || (filtroReservasTurnos === 'con_reservas' && Number(turno.reservas_confirmadas) > 0)
      || (filtroReservasTurnos === 'sin_reservas' && Number(turno.reservas_confirmadas) === 0))
    &&
    (!fechaFiltroTurnos || claveFechaTurno(turno.fecha) === fechaFiltroTurnos)
    && (!actividadFiltroTurnos || turno.actividad === actividadFiltroTurnos)
  ));
  const turnosFuturosVisibles = turnosFuturosFiltrados.slice(0, cantidadTurnosVisibles);

  return (
    <section className="empleado-page">
      <header className="empleado-header">
        <div>
          <span className="empleado-eyebrow">FUERZA VITAL · RECEPCIÓN</span>
          <h1>Hola, {usuario?.nombre || 'Empleado'}</h1>
          <p>
            {resumen?.sede
              ? `${resumen.sede}${resumen.ciudad ? ` · ${resumen.ciudad}` : ''}`
              : 'Gestiona la operación de tu sede.'}
          </p>
        </div>
        <button type="button" className="empleado-refresh" onClick={cargarResumen} disabled={cargando}>
          <i className={`fa-solid fa-rotate ${cargando ? 'empleado-spinning' : ''}`} aria-hidden="true"></i>
          Actualizar
        </button>
      </header>

      {mensaje && <div className={`empleado-feedback ${tipoMensaje}`} role={tipoMensaje === 'error' ? 'alert' : 'status'}>{mensaje}</div>}
      {error && (
        <div className="empleado-feedback error" role="alert">
          {error}
          <button type="button" onClick={cargarResumen}>Reintentar</button>
        </div>
      )}

      <section className="empleado-summary" aria-label="Resumen de turnos de hoy">
        <article>
          <span>Turnos de hoy</span>
          <strong>{cargando ? '—' : turnos.length}</strong>
        </article>
        <article>
          <span>Reservas confirmadas</span>
          <strong>{cargando ? '—' : turnos.reduce((total, turno) => total + Number(turno.reservas_confirmadas), 0)}</strong>
        </article>
        <article>
          <span>Asistencias registradas</span>
          <strong>{cargando ? '—' : turnos.reduce((total, turno) => total + Number(turno.asistencias_registradas), 0)}</strong>
        </article>
      </section>

      <section className="empleado-panel">
        <div className="empleado-panel-heading">
          <div>
            <h2>Agenda de hoy</h2>
            <p>{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>

        {cargando ? (
          <p className="empleado-empty">Cargando turnos...</p>
        ) : turnos.length === 0 ? (
          <p className="empleado-empty">No tienes turnos asignados para hoy.</p>
        ) : (
          <div className="empleado-turnos">
            {turnos.map((turno) => (
              <article
                className={`empleado-turno${turnoSeleccionado === turno.id ? ' seleccionado' : ''}`}
                key={turno.id}
              >
                <div className="empleado-turno-time">
                  <strong>{formatearHora(turno.fecha)}</strong>
                  <span>{turno.reservas_confirmadas}/{turno.cupo_maximo} reservados</span>
                </div>
                <div className="empleado-turno-info">
                  <h3>{turno.actividad}</h3>
                  <span>{Number(turno.es_entrenador) ? 'Estás asignado a este turno' : 'Turno de tu sede'}</span>
                  <span>Entrenadores: {turno.entrenadores || 'Sin asignar'}</span>
                  <span>{turno.asistencias_registradas} asistencias registradas</span>
                </div>
                <button type="button" onClick={() => abrirTurno(turno.id)}>
                  Ver lista
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {turnoSeleccionado && (
        <section className="empleado-panel">
          <div className="empleado-panel-heading">
            <div>
              <h2>Lista de reservas</h2>
              <p>Solo se muestran reservas confirmadas de turnos asignados a ti.</p>
            </div>
          </div>
          {cargandoReservas ? (
            <p className="empleado-empty">Cargando lista...</p>
          ) : reservas.length === 0 ? (
            <p className="empleado-empty">
              No hay reservas vigentes para este turno. Se ocultan una hora después del inicio.
            </p>
          ) : (
            <div className="empleado-table-wrap">
              <table className="empleado-table">
                <thead>
                  <tr><th>Socio</th><th>Correo</th><th>Membresía</th><th>Asistencia</th></tr>
                </thead>
                <tbody>
                  {reservas.map((reserva) => {
                    const membresiaVigente = Boolean(Number(reserva.membresia_vigente));
                    return (
                      <tr key={reserva.reserva_id}>
                        <td>{reserva.nombre}</td>
                        <td>{reserva.correo_electronico}</td>
                        <td>
                          <span className={`empleado-status ${membresiaVigente ? 'vigente' : 'vencida'}`}>
                            {membresiaVigente
                              ? `Vigente hasta ${formatearFecha(reserva.membresia_vence)}`
                              : 'Sin membresía vigente'}
                          </span>
                        </td>
                        <td>
                          {reserva.asistencia_id ? (
                            <span className="empleado-status vigente">
                              Presente · {formatearHora(reserva.registrado_en)}
                            </span>
                          ) : !membresiaVigente ? (
                            <span className="empleado-status vencida">
                              Requiere membresía vigente
                            </span>
                          ) : !Number(reserva.puede_registrar_asistencia) ? (
                            <span className="empleado-status vencida">
                              Disponible desde el inicio del turno
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="empleado-checkin"
                              onClick={() => registrarAsistencia(reserva.reserva_id)}
                            >
                              Registrar llegada
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <section className="empleado-panel">
        <div className="empleado-panel-heading">
          <div>
            <h2>Próximos turnos</h2>
            <p>Tus clases asignadas desde mañana durante los próximos 7 días.</p>
          </div>
        </div>

        {cargando ? (
          <p className="empleado-empty">Cargando próximos turnos...</p>
        ) : turnosFuturos.length === 0 ? (
          <p className="empleado-empty">No tienes clases asignadas para los próximos 7 días.</p>
        ) : (
          <>
            <div className="empleado-upcoming-filters">
              <label>
                <span>Filtrar por reservas</span>
                <select
                  value={filtroReservasTurnos}
                  onChange={(event) => {
                    setFiltroReservasTurnos(event.target.value);
                    setCantidadTurnosVisibles(5);
                  }}
                >
                  <option value="con_reservas">Con reservas</option>
                  <option value="todos">Todos los turnos</option>
                  <option value="sin_reservas">Sin reservas</option>
                </select>
              </label>
              <label>
                <span>Filtrar por día</span>
                <select
                  value={fechaFiltroTurnos}
                  onChange={(event) => {
                    setFechaFiltroTurnos(event.target.value);
                    setCantidadTurnosVisibles(5);
                  }}
                >
                  <option value="">Todos los días</option>
                  {fechasTurnosFuturos.map((fecha) => {
                    const turnoDelDia = turnosFuturos.find((turno) => claveFechaTurno(turno.fecha) === fecha);
                    return (
                      <option key={fecha} value={fecha}>
                        {turnoDelDia ? formatearFechaTurno(turnoDelDia.fecha) : fecha}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label>
                <span>Filtrar por clase</span>
                <select
                  value={actividadFiltroTurnos}
                  onChange={(event) => {
                    setActividadFiltroTurnos(event.target.value);
                    setCantidadTurnosVisibles(5);
                  }}
                >
                  <option value="">Todas las clases</option>
                  {actividadesTurnosFuturos.map((actividad) => (
                    <option key={actividad} value={actividad}>{actividad}</option>
                  ))}
                </select>
              </label>
            </div>
            {turnosFuturosFiltrados.length === 0 ? (
              <p className="empleado-empty">No hay turnos que coincidan con esos filtros.</p>
            ) : (
              <>
                <p className="empleado-upcoming-count">
                  Mostrando {turnosFuturosVisibles.length} de {turnosFuturosFiltrados.length} turnos
                </p>
                <div className="empleado-upcoming-list">
                  {turnosFuturosVisibles.map((turno) => (
                    <article className="empleado-upcoming-item" key={turno.id}>
                      <div className="empleado-upcoming-date">
                        <strong>{formatearFechaTurno(turno.fecha)}</strong>
                        <span>{formatearHora(turno.fecha)}</span>
                      </div>
                      <div className="empleado-upcoming-info">
                        <h3>{turno.actividad}</h3>
                        <span>Entrenadores: {turno.entrenadores || 'Sin asignar'}</span>
                      </div>
                      <span className="empleado-upcoming-capacity">
                        {turno.reservas_confirmadas}/{turno.cupo_maximo} reservados
                      </span>
                    </article>
                  ))}
                </div>
                {turnosFuturosVisibles.length < turnosFuturosFiltrados.length && (
                  <button
                    type="button"
                    className="empleado-show-more"
                    onClick={() => setCantidadTurnosVisibles((cantidad) => cantidad + 5)}
                  >
                    Mostrar 5 más
                  </button>
                )}
              </>
            )}
          </>
        )}
      </section>

      <section className="empleado-panel">
        <div className="empleado-panel-heading">
          <div>
            <h2>Buscar socio</h2>
            <p>La búsqueda está limitada a socios activos de tu sede.</p>
          </div>
        </div>
        <form className="empleado-search" onSubmit={buscarSocios}>
          <div className="empleado-search-field">
            <input
              type="search"
              value={busqueda}
              onChange={(event) => {
                setBusqueda(event.target.value);
                setSocios([]);
                setBusquedaRealizada(false);
                setSugerenciasAbiertas(true);
                setConsultarSugerencias(true);
              }}
              onFocus={() => {
                if (consultarSugerencias) setSugerenciasAbiertas(true);
              }}
              onBlur={() => window.setTimeout(() => setSugerenciasAbiertas(false), 120)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setSugerenciasAbiertas(false);
              }}
              placeholder="Nombre, correo o teléfono"
              aria-label="Buscar socio por nombre, correo o teléfono"
              aria-autocomplete="list"
              aria-expanded={sugerenciasAbiertas && busqueda.trim().length >= 2}
              aria-controls="empleado-sugerencias-socios"
              minLength={2}
            />
            {sugerenciasAbiertas && busqueda.trim().length >= 2 && (
              <ul className="empleado-suggestions" id="empleado-sugerencias-socios">
                {buscandoSugerencias ? (
                  <li className="empleado-suggestions-message">Buscando socios...</li>
                ) : errorSugerencias ? (
                  <li className="empleado-suggestions-message error" role="alert">{errorSugerencias}</li>
                ) : sugerencias.length === 0 ? (
                  <li className="empleado-suggestions-message">No se encontraron coincidencias.</li>
                ) : (
                  sugerencias.map((socio) => (
                    <li key={socio.id}>
                      <button
                        type="button"
                        className="empleado-suggestion"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => seleccionarSugerencia(socio)}
                      >
                        {socio.nombre} · {socio.correo_electronico}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
          <button type="submit" disabled={buscandoSocios}>
            {buscandoSocios ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
        {socios.length > 0 && (
          <div className="empleado-table-wrap">
            <table className="empleado-table">
              <thead>
                <tr><th>Socio</th><th>Correo</th><th>Teléfono</th><th>Membresía</th><th>Entrenamiento libre</th></tr>
              </thead>
              <tbody>
                {socios.map((socio) => (
                  <tr key={socio.id}>
                    <td>{socio.nombre}</td>
                    <td>{socio.correo_electronico}</td>
                    <td>{socio.telefono || '—'}</td>
                    <td>
                      <span className={`empleado-status ${Number(socio.membresia_vigente) ? 'vigente' : 'vencida'}`}>
                        {Number(socio.membresia_vigente)
                          ? `Vigente hasta ${formatearFecha(socio.membresia_vence)}`
                          : 'Sin membresía vigente'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="empleado-checkin"
                        disabled={
                          !Number(socio.membresia_vigente)
                          || ingresoEnCurso === socio.id
                          || socio.ingreso_registrado
                        }
                        onClick={() => registrarIngresoLibre(socio)}
                      >
                        {ingresoEnCurso === socio.id
                          ? 'Registrando...'
                          : socio.ingreso_registrado
                            ? 'Ingreso registrado'
                            : Number(socio.membresia_vigente)
                              ? 'Registrar ingreso'
                              : 'Membresía inactiva'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {busquedaRealizada && !buscandoSocios && busqueda.length >= 2 && socios.length === 0 && (
          <p className="empleado-empty">No se encontraron socios con esos datos.</p>
        )}
      </section>
    </section>
  );
}

export default Empleado;
