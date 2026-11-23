import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ENDPOINTS_LOCAL, API_LOCAL } from '../api/endpoints';
import http from '../utils/axiosConfig';
import '../styles/Actividades.css';
import defaultImagen from '/assets/fuerzavitalgym.png';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routers/routes';

const getStartOfWeek = (date) => {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));
  start.setHours(0, 0, 0, 0);
  return start;
};

const addWeeks = (date, weeks) => {
  const next = new Date(date);
  next.setDate(next.getDate() + weeks * 7);
  return next;
};

const getDateKey = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

const formatDateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Fecha no disponible'
    : date.toLocaleString('es-AR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
};

function Actividades() {
  const { token, usuario } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [actividades, setActividades] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [diaFiltro, setDiaFiltro] = useState(() => getDateKey(new Date()));
  const [horaFiltro, setHoraFiltro] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [errorCarga, setErrorCarga] = useState('');
  const [cargando, setCargando] = useState(true);
  const [reservaEnCurso, setReservaEnCurso] = useState(null);
  const navigate = useNavigate();

  const vista = searchParams.get('vista') === 'calendario' ? 'calendario' : 'lista';

  const cambiarVista = (nuevaVista) => {
    const parametros = new URLSearchParams(searchParams);
    if (nuevaVista === 'lista') parametros.delete('vista');
    else parametros.set('vista', nuevaVista);
    setSearchParams(parametros, { replace: true });
  };

  const fetchActividades = useCallback(async () => {
    if (!token) {
      setCargando(false);
      setErrorCarga('Inicia sesión para consultar las actividades disponibles.');
      return;
    }

    setCargando(true);
    setErrorCarga('');
    try {
      const { data } = await http.get(ENDPOINTS_LOCAL.ACTIVIDADES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!Array.isArray(data)) {
        throw new Error('El servidor devolvió un formato de actividades inválido.');
      }
      setActividades(data);
    } catch (error) {
      setErrorCarga(error.response?.data?.error || 'No se pudieron cargar las actividades.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    fetchActividades();
  }, [fetchActividades]);

  const weekEnd = addWeeks(currentWeekStart, 1);
  const actividadesSemana = useMemo(() => actividades.filter((actividad) => {
    const fecha = new Date(actividad.fecha);
    return !Number.isNaN(fecha.getTime())
      && fecha >= new Date()
      && fecha >= currentWeekStart
      && fecha < weekEnd;
  }), [actividades, currentWeekStart, weekEnd]);

  const actividadesFiltradas = useMemo(() => actividadesSemana.filter((actividad) => {
    const fecha = new Date(actividad.fecha);
    const nombreMatch = nombreFiltro
      ? actividad.nombre.toLocaleLowerCase('es-AR').includes(nombreFiltro.toLocaleLowerCase('es-AR'))
      : true;
    const diaMatch = diaFiltro ? getDateKey(fecha) === diaFiltro : true;
    const horaMatch = horaFiltro
      ? fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) === horaFiltro
      : true;
    return nombreMatch && diaMatch && horaMatch;
  }), [actividadesSemana, nombreFiltro, diaFiltro, horaFiltro]);

  const diasUnicos = useMemo(() => {
    const dias = new Set(actividadesSemana.map(
      (actividad) => getDateKey(new Date(actividad.fecha))
    ));
    if (getDateKey(currentWeekStart) === getDateKey(getStartOfWeek(new Date()))) {
      dias.add(getDateKey(new Date()));
    }
    return [...dias].sort();
  }, [actividadesSemana, currentWeekStart]);
  const nombresUnicos = useMemo(() => [...new Set(
    actividadesSemana.map((actividad) => actividad.nombre)
  )].sort((a, b) => a.localeCompare(b, 'es-AR')), [actividadesSemana]);
  const horasUnicas = useMemo(() => [...new Set(
    actividadesSemana.map((actividad) => new Date(actividad.fecha)
      .toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }))
  )].sort(), [actividadesSemana]);

  const crearReserva = async (turnoId) => {
    setReservaEnCurso(turnoId);
    setMensaje(null);
    try {
      const { data } = await http.post(ENDPOINTS_LOCAL.RESERVAS, { turno_id: turnoId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTipoMensaje('success');
      setMensaje(Number(data.puede_cancelar)
        ? 'Reserva creada con éxito.'
        : 'Reserva creada. Como faltan menos de 24 horas para el turno, ya no se puede cancelar.');
      await fetchActividades();
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'No se pudo crear la reserva.');
    } finally {
      setReservaEnCurso(null);
    }
  };

  const cambiarSemana = (cantidad) => {
    setCurrentWeekStart((week) => addWeeks(week, cantidad));
    setNombreFiltro('');
    setDiaFiltro('');
    setHoraFiltro('');
  };

  const hoyInicioSemana = getStartOfWeek(new Date());
  const semanaAnteriorDeshabilitada = currentWeekStart <= hoyInicioSemana;
  const ultimoDiaSemana = addWeeks(currentWeekStart, 1);
  ultimoDiaSemana.setDate(ultimoDiaSemana.getDate() - 1);
  const tituloSemana = `${currentWeekStart.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} – ${
    ultimoDiaSemana.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
  }`;

  const renderBotonReserva = (actividad) => (
    <button
      type="button"
      className="actividad-reservar"
      onClick={() => crearReserva(actividad.turno_id)}
      disabled={Number(actividad.cupo_disponible) <= 0 || reservaEnCurso !== null}
    >
      {reservaEnCurso === actividad.turno_id
        ? 'Reservando...'
        : Number(actividad.cupo_disponible) <= 0
          ? 'Sin cupos'
          : 'Reservar'}
    </button>
  );

  const renderTarjetaActividad = (actividad) => (
    <article className="actividad-card" key={actividad.turno_id}>
      <div className="actividad-foto">
        <img
          src={actividad.foto ? `${API_LOCAL}${actividad.foto}` : defaultImagen}
          alt={actividad.nombre}
          loading="lazy"
        />
      </div>
      <div className="actividad-info">
        <h3>{actividad.nombre}</h3>
        <p><i className="fa-regular fa-clock" aria-hidden="true"></i> {formatDateTime(actividad.fecha)}</p>
        <p>
          <i className="fa-solid fa-users" aria-hidden="true"></i>
          {' '}Cupos: {actividad.cupo_disponible} de {actividad.cupo_maximo}
        </p>
        <p>
          <i className="fa-solid fa-person-chalkboard" aria-hidden="true"></i>
          {' '}Entrenadores: {actividad.entrenadores || 'A confirmar'}
        </p>
        {renderBotonReserva(actividad)}
      </div>
      <div className="actividad-descripcion">
        <p>{actividad.descripcion || 'Consultá en la sede para conocer más sobre esta actividad.'}</p>
      </div>
    </article>
  );

  return (
    <section className="actividades-container">
      <header className="actividades-header">
        <div>
          <span className="actividades-eyebrow">ENTRENÁ A TU RITMO</span>
          <h1>Actividades</h1>
          <p>Explorá los turnos de tu sede y reservá tu lugar.</p>
        </div>
        <div className="actividades-view-toggle" role="group" aria-label="Cambiar vista de actividades">
          <button
            type="button"
            className={vista === 'lista' ? 'active' : ''}
            aria-pressed={vista === 'lista'}
            onClick={() => cambiarVista('lista')}
          >
            <i className="fa-solid fa-list" aria-hidden="true"></i>
            Lista
          </button>
          <button
            type="button"
            className={vista === 'calendario' ? 'active' : ''}
            aria-pressed={vista === 'calendario'}
            onClick={() => cambiarVista('calendario')}
          >
            <i className="fa-solid fa-calendar-days" aria-hidden="true"></i>
            Calendario
          </button>
        </div>
      </header>

      <aside className="actividades-policy" role="note">
        Puedes cancelar una reserva hasta 24 horas antes del turno. Si reservas con menos anticipación,
        no podrás cancelarla. Si no se registra tu asistencia, la reserva expira una hora después del inicio.
      </aside>

      {usuario?.rol === 'socio' && (
        <section className="entrenamiento-libre-card" aria-labelledby="entrenamiento-libre-titulo">
          <span className="entrenamiento-libre-icon" aria-hidden="true">
            <i className="fa-solid fa-dumbbell"></i>
          </span>
          <div>
            <h2 id="entrenamiento-libre-titulo">Entrenamiento libre</h2>
            <p>
              No necesitas reservar un turno. Acércate a recepción para validar tu membresía y registrar tu ingreso.
            </p>
          </div>
        </section>
      )}

      {mensaje && (
        <div className={`actividades-feedback ${tipoMensaje}`} role={tipoMensaje === 'error' ? 'alert' : 'status'}>
          <span>{mensaje}</span>
          {mensaje.toLocaleLowerCase('es-AR').includes('membresía') && (
            <button type="button" onClick={() => navigate(ROUTES.MEMBRESIAS)}>Ver membresía</button>
          )}
          {mensaje.toLocaleLowerCase('es-AR').includes('ya tienes una reserva') && (
            <button type="button" onClick={() => navigate(ROUTES.RESERVAS)}>Ir a mis reservas</button>
          )}
        </div>
      )}

      <div className="actividades-week-nav">
        <button
          type="button"
          onClick={() => cambiarSemana(-1)}
          disabled={semanaAnteriorDeshabilitada}
          aria-label="Ver semana anterior"
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
          <span>Anterior</span>
        </button>
        <strong>{tituloSemana}</strong>
        <button
          type="button"
          onClick={() => cambiarSemana(1)}
          aria-label="Ver semana siguiente"
        >
          <span>Siguiente</span>
          <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>

      {vista === 'lista' && (
        <div className="filtros-actividades">
          <label>
            <span>Actividad</span>
            <select value={nombreFiltro} onChange={(event) => setNombreFiltro(event.target.value)}>
              <option value="">Todas las actividades</option>
              {nombresUnicos.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
            </select>
          </label>
          <label>
            <span>Día</span>
            <select value={diaFiltro} onChange={(event) => setDiaFiltro(event.target.value)}>
              <option value="">Todos los días</option>
              {diasUnicos.map((dia) => (
                <option key={dia} value={dia}>
                  {dia === getDateKey(new Date()) ? 'Hoy · ' : ''}
                  {new Date(`${dia}T12:00:00`).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'short',
                  })}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Horario</span>
            <select value={horaFiltro} onChange={(event) => setHoraFiltro(event.target.value)}>
              <option value="">Todos los horarios</option>
              {horasUnicas.map((hora) => <option key={hora} value={hora}>{hora}</option>)}
            </select>
          </label>
        </div>
      )}

      {cargando ? (
        <div className="actividades-empty">Cargando actividades...</div>
      ) : errorCarga ? (
        <div className="actividades-empty actividades-load-error" role="alert">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
          <p>{errorCarga}</p>
          <button type="button" onClick={fetchActividades}>Intentar nuevamente</button>
        </div>
      ) : actividadesSemana.length === 0 ? (
        <div className="actividades-empty">
          <i className="fa-regular fa-calendar-xmark" aria-hidden="true"></i>
          <strong>No hay turnos esta semana</strong>
          <p>Probá consultar la semana siguiente.</p>
        </div>
      ) : vista === 'lista' ? (
        actividadesFiltradas.length > 0 ? (
          <div className="actividades-list">
            {actividadesFiltradas.map(renderTarjetaActividad)}
          </div>
        ) : (
          <div className="actividades-empty">
            <strong>No encontramos turnos con esos filtros</strong>
            <p>Probá cambiar el día, horario o actividad seleccionada.</p>
          </div>
        )
      ) : (
        <div className="calendario-grid">
          {Array.from({ length: 7 }, (_, index) => {
            const fechaDia = new Date(currentWeekStart);
            fechaDia.setDate(fechaDia.getDate() + index);
            const turnosDia = actividadesSemana.filter(
              (actividad) => getDateKey(new Date(actividad.fecha)) === getDateKey(fechaDia)
            );
            const tituloDia = fechaDia.toLocaleDateString('es-AR', {
              weekday: 'long',
              day: '2-digit',
              month: 'short',
            });

            return (
              <section className="calendario-dia" key={getDateKey(fechaDia)}>
                <h2>{tituloDia}</h2>
                {turnosDia.length === 0 ? (
                  <p className="sin-turnos">Sin actividades</p>
                ) : (
                  turnosDia.map((actividad) => (
                    <article className="calendario-turno" key={actividad.turno_id}>
                      <strong>{actividad.nombre}</strong>
                      <span>
                        {new Date(actividad.fecha).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hourCycle: 'h23',
                        })}
                      </span>
                      <small>Entrenadores: {actividad.entrenadores || 'A confirmar'}</small>
                      <small>Cupos: {actividad.cupo_disponible} / {actividad.cupo_maximo}</small>
                      {renderBotonReserva(actividad)}
                    </article>
                  ))
                )}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Actividades;
