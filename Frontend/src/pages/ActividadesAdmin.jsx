import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { ENDPOINTS_LOCAL, API_LOCAL } from '../api/endpoints';
import defaultImagen from '/assets/fuerzavitalgym.png';
import '../styles/ActividadesAdmin.css';
import TablePagination from '../components/TablePagination';
import useTablePagination from '../hooks/useTablePagination';
import AdminFormModal from '../components/AdminFormModal';

const inicioDeSemana = (fecha) => {
  const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const diasDesdeLunes = (inicio.getDay() + 6) % 7;
  inicio.setDate(inicio.getDate() - diasDesdeLunes);
  return inicio;
};

const normalizarBusqueda = (valor) => String(valor ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase();

function ActividadesAdmin() {
  const { token } = useAuthStore();
  const [actividades, setActividades] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activas');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [actividadParaInactivar, setActividadParaInactivar] = useState(null);

  // Form actividad
  const [form, setForm] = useState({ nombre: '', descripcion: '', ubicacion_id: '' });
  const [foto, setFoto] = useState(null);
  const [nombreFoto, setNombreFoto] = useState('Ningún archivo seleccionado');
  const fotoInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [actividadFormOpen, setActividadFormOpen] = useState(false);

  // Mensajes
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState(''); // 'success' | 'error'

  // Turnos
  const [turnos, setTurnos] = useState([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  const [busquedaTurnos, setBusquedaTurnos] = useState('');
  const [filtroEntrenadoresTurnos, setFiltroEntrenadoresTurnos] = useState('todos');
  const [semanaTurnos, setSemanaTurnos] = useState(() => inicioDeSemana(new Date()));

  // Form crear turno
  const [turnoForm, setTurnoForm] = useState({ fecha: '', cupo_maximo: '', entrenadores: [] });
  const [turnoFormOpen, setTurnoFormOpen] = useState(false);

  // Form editar turno
  const [turnoEditMode, setTurnoEditMode] = useState(null); // turno id que se edita
  const [turnoEditForm, setTurnoEditForm] = useState({ fecha: '', cupo_maximo: '', entrenadores: [] });

  const actividadesFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();
    return actividades.filter((actividad) => {
      const coincideNombre = !termino || actividad.nombre?.toLocaleLowerCase().includes(termino);
      const coincideUbicacion = !filtroUbicacion
        || String(actividad.ubicacion_id) === filtroUbicacion;
      return coincideNombre && coincideUbicacion;
    });
  }, [actividades, busqueda, filtroUbicacion]);
  const { pageItems: actividadesPagina, ...paginacionActividades } = useTablePagination(
    actividadesFiltradas,
    `${filtroEstado}-${filtroUbicacion}-${busqueda}`
  );
  const ubicacionesFiltro = useMemo(() => {
    const ubicacionesPorId = new Map();
    actividades.forEach((actividad) => {
      if (actividad.ubicacion_id != null) {
        ubicacionesPorId.set(String(actividad.ubicacion_id), {
          id: actividad.ubicacion_id,
          nombre: actividad.ubicacion_nombre,
          ciudad: actividad.ubicacion_ciudad,
        });
      }
    });
    return Array.from(ubicacionesPorId.values());
  }, [actividades]);
  const finSemanaTurnos = useMemo(() => {
    const fin = new Date(semanaTurnos);
    fin.setDate(fin.getDate() + 7);
    return fin;
  }, [semanaTurnos]);
  const turnosSemana = useMemo(() => turnos.filter((turno) => {
    const fecha = new Date(turno.fecha);
    return fecha >= semanaTurnos && fecha < finSemanaTurnos;
  }), [turnos, semanaTurnos, finSemanaTurnos]);
  const turnosFiltrados = useMemo(() => {
    const termino = normalizarBusqueda(busquedaTurnos.trim());
    return turnosSemana.filter((turno) => {
      const fechaTurno = new Date(turno.fecha);
      const diaSemana = normalizarBusqueda(fechaTurno.toLocaleDateString('es-AR', { weekday: 'long' }));
      const fecha = normalizarBusqueda(fechaTurno.toLocaleString('es-AR'));
      const entrenadores = normalizarBusqueda(turno.entrenadores);
      const coincideBusqueda = !termino
        || diaSemana.includes(termino)
        || fecha.includes(termino)
        || entrenadores.includes(termino);
      const tieneEntrenadores = Boolean(turno.entrenador_ids);
      const coincideFiltroEntrenadores = filtroEntrenadoresTurnos === 'todos'
        || (filtroEntrenadoresTurnos === 'asignados' && tieneEntrenadores)
        || (filtroEntrenadoresTurnos === 'sin-asignar' && !tieneEntrenadores);
      return coincideBusqueda && coincideFiltroEntrenadores;
    });
  }, [turnosSemana, busquedaTurnos, filtroEntrenadoresTurnos]);
  const moverSemanaTurnos = (semanas) => {
    setSemanaTurnos((actual) => {
      const siguiente = new Date(actual);
      siguiente.setDate(siguiente.getDate() + semanas * 7);
      return siguiente;
    });
  };
  const volverASemanaActual = () => setSemanaTurnos(inicioDeSemana(new Date()));

  // Cargar actividades
  const fetchActividades = useCallback(async () => {
    try {
      const endpoint = ENDPOINTS_LOCAL.ACTIVIDADES_SIMPLE ?? `${ENDPOINTS_LOCAL.ACTIVIDADES}-simple`;
      const url = `${endpoint}?estado=${filtroEstado}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActividades(res.data);
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al cargar actividades');
    }
  }, [token, filtroEstado]);

  // Cargar ubicaciones
  const fetchUbicaciones = useCallback(async () => {
    try {
      const res = await axios.get(ENDPOINTS_LOCAL.UBICACIONES);
      setUbicaciones(res.data);
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
    }
  }, []);

  const fetchEmpleados = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [activos, inactivos] = await Promise.all([
        axios.get(ENDPOINTS_LOCAL.USUARIOS, config),
        axios.get(`${ENDPOINTS_LOCAL.USUARIOS}?soloInactivos=true`, config),
      ]);
      const empleadosPorId = new Map(
        [...activos.data, ...inactivos.data]
          .filter((usuario) => usuario.rol === 'empleado')
          .map((usuario) => [Number(usuario.id), usuario])
      );
      setEmpleados(Array.from(empleadosPorId.values()));
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'No se pudieron cargar los empleados');
    }
  }, [token]);

  useEffect(() => {
    fetchActividades();
    fetchUbicaciones();
    fetchEmpleados();
  }, [fetchActividades, fetchUbicaciones, fetchEmpleados]);

  const cambiarEntrenador = (actualizarFormulario, entrenadorId, seleccionado) => {
    const id = Number(entrenadorId);
    actualizarFormulario((actual) => ({
      ...actual,
      entrenadores: seleccionado
        ? [...actual.entrenadores, id]
        : actual.entrenadores.filter((actualId) => actualId !== id),
    }));
  };

  const empleadosParaFormulario = (entrenadoresSeleccionados) => {
    const sedeId = String(actividadSeleccionada?.ubicacion_id);
    const idsSeleccionados = new Set(entrenadoresSeleccionados.map(Number));
    return empleados.filter((empleado) => (
      String(empleado.ubicacion_id) === sedeId || idsSeleccionados.has(Number(empleado.id))
    ));
  };

  const resetFoto = () => {
    setFoto(null);
    setNombreFoto('Ningún archivo seleccionado');
    if (fotoInputRef.current) fotoInputRef.current.value = '';
  };

  // Crear o actualizar actividad
  const handleSubmitActividad = async (e) => {
    e.preventDefault();
    setMensaje('');
    setTipoMensaje('');

    try {
      const formData = new FormData();
      formData.append('nombre', form.nombre);
      formData.append('descripcion', form.descripcion);
      formData.append('ubicacion_id', form.ubicacion_id);
      if (foto) formData.append('foto', foto);

      if (editingId) {
        await axios.put(`${ENDPOINTS_LOCAL.ACTIVIDADES}/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        setTipoMensaje('success');
        setMensaje('Actividad actualizada con éxito');
      } else {
        await axios.post(ENDPOINTS_LOCAL.ACTIVIDADES, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        setTipoMensaje('success');
        setMensaje('Actividad creada con éxito');
      }

      setForm({ nombre: '', descripcion: '', ubicacion_id: '' });
      resetFoto();
      setEditingId(null);
      setActividadFormOpen(false);
      fetchActividades();
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al guardar actividad');
    }
  };

  // Editar actividad
  const handleEditActividad = (actividad) => {
    resetFoto();
    setForm({
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
      ubicacion_id: actividad.ubicacion_id
    });
    setEditingId(actividad.id);
    setMensaje('');
    setActividadFormOpen(true);
  };

  const handleCreateActividad = () => {
    setForm({ nombre: '', descripcion: '', ubicacion_id: '' });
    resetFoto();
    setEditingId(null);
    setMensaje('');
    setActividadFormOpen(true);
  };

  // Cancelar edición actividad
  const handleCancelEditActividad = () => {
    setForm({ nombre: '', descripcion: '', ubicacion_id: '' });
    resetFoto();
    setEditingId(null);
    setActividadFormOpen(false);
  };

  // Eliminar actividad
  const handleDeleteActividad = async (id) => {
    try {
      await axios.delete(`${ENDPOINTS_LOCAL.ACTIVIDADES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTipoMensaje('success');
      setMensaje('Actividad cambiada a inactiva; puedes consultarla en la lista de inactivas');
      // Si la actividad seleccionada fue eliminada, cerrar la sección de turnos
      if (actividadSeleccionada?.id === id) {
        setActividadSeleccionada(null);
        setTurnos([]);
      }
      fetchActividades();
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al eliminar actividad');
    }
  };

  const handleConfirmarInactividad = async () => {
    if (!actividadParaInactivar) return;
    await handleDeleteActividad(actividadParaInactivar.id);
    setActividadParaInactivar(null);
  };

  const handleActivarActividad = async (id) => {
    try {
      await axios.patch(`${ENDPOINTS_LOCAL.ACTIVIDADES}/${id}/activar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTipoMensaje('success');
      setMensaje('Actividad activada');
      fetchActividades();
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al activar actividad');
    }
  };

  // Ver turnos de una actividad
  const handleViewTurnos = async (actividad) => {
    try {
      const res = await axios.get(`${ENDPOINTS_LOCAL.ACTIVIDADES}/${actividad.id}/turnos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (String(actividadSeleccionada?.id) !== String(actividad.id)) {
        setBusquedaTurnos('');
        setFiltroEntrenadoresTurnos('todos');
      }
      setTurnos(res.data);
      setActividadSeleccionada(actividad);
      setTurnoForm({ fecha: '', cupo_maximo: '', entrenadores: [] });
      setTurnoFormOpen(false);
      setTurnoEditMode(null);
      setTurnoEditForm({ fecha: '', cupo_maximo: '', entrenadores: [] });
      // Scroll a sección turnos
      const el = document.querySelector('.turnos-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al obtener turnos');
    }
  };

  const handleOpenCreateTurno = () => {
    setTurnoForm({ fecha: '', cupo_maximo: '', entrenadores: [] });
    setMensaje('');
    setTipoMensaje('');
    setTurnoFormOpen(true);
  };

  const handleCloseCreateTurno = () => {
    setTurnoFormOpen(false);
    setTurnoForm({ fecha: '', cupo_maximo: '', entrenadores: [] });
    setMensaje('');
    setTipoMensaje('');
  };

  // Crear turno
  const handleCreateTurno = async (e) => {
    e.preventDefault();
    setMensaje('');
    setTipoMensaje('');

    if (!actividadSeleccionada) return;
    const { fecha, cupo_maximo, entrenadores } = turnoForm;
    if (!fecha || !cupo_maximo) {
      setTipoMensaje('error');
      setMensaje('Fecha y cupo máximo son obligatorios');
      return;
    }

    try {
      await axios.post(ENDPOINTS_LOCAL.TURNOS, {
        actividad_id: actividadSeleccionada.id,
        fecha,
        cupo_maximo: Number(cupo_maximo),
        entrenadores,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTipoMensaje('success');
      setMensaje('Turno creado con éxito');
      await handleViewTurnos(actividadSeleccionada);
      setTurnoForm({ fecha: '', cupo_maximo: '', entrenadores: [] });
      setTurnoFormOpen(false);
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al crear turno');
    }
  };

  // Iniciar edición de turno
  const startEditTurno = (turno) => {
    setMensaje('');
    setTipoMensaje('');
    setTurnoEditMode(turno.id);
    // Normalizar fecha a input datetime-local si viene en ISO completo
    const dt = new Date(turno.fecha);
    const localISO = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setTurnoEditForm({
      fecha: localISO,
      cupo_maximo: turno.cupo_maximo,
      entrenadores: turno.entrenador_ids
        ? String(turno.entrenador_ids).split(',').map(Number)
        : [],
    });
  };

  // Cancelar edición de turno
  const cancelEditTurno = () => {
    setTurnoEditMode(null);
    setTurnoEditForm({ fecha: '', cupo_maximo: '', entrenadores: [] });
    setMensaje('');
    setTipoMensaje('');
  };

  // Guardar edición turno
  const handleUpdateTurno = async (e) => {
    e.preventDefault();
    setMensaje('');
    setTipoMensaje('');

    if (!turnoEditMode) return;
    const { fecha, cupo_maximo, entrenadores } = turnoEditForm;
    if (!fecha || !cupo_maximo) {
      setTipoMensaje('error');
      setMensaje('Fecha y cupo máximo son obligatorios');
      return;
    }

    try {
      await axios.put(`${ENDPOINTS_LOCAL.TURNOS}/${turnoEditMode}`, {
        fecha,
        cupo_maximo: Number(cupo_maximo),
        entrenadores,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTipoMensaje('success');
      setMensaje('Turno actualizado con éxito');
      await handleViewTurnos(actividadSeleccionada);
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al actualizar turno');
    }
  };

  // Eliminar turno
  const handleDeleteTurno = async (turnoId) => {
    try {
      await axios.delete(`${ENDPOINTS_LOCAL.TURNOS}/${turnoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTipoMensaje('success');
      setMensaje('Turno eliminado con éxito');
      await handleViewTurnos(actividadSeleccionada);
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al eliminar turno');
    }
  };

  const ultimoDiaSemanaTurnos = new Date(finSemanaTurnos);
  ultimoDiaSemanaTurnos.setDate(ultimoDiaSemanaTurnos.getDate() - 1);
  const etiquetaSemanaTurnos = `${semanaTurnos.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })} – ${ultimoDiaSemanaTurnos.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })}`;
  const esSemanaActual = semanaTurnos.getTime() === inicioDeSemana(new Date()).getTime();

  return (
    <div className="actividades-admin">
      <header className="actividades-admin-header">
        <h1>Gestión de Actividades y Turnos</h1>
        <button type="button" className="actividad-open-form-button" onClick={handleCreateActividad}>
          <i className="fa-solid fa-circle-plus" aria-hidden="true"></i>
          Crear actividad
        </button>
      </header>

      {mensaje && !actividadFormOpen && !turnoFormOpen && !turnoEditMode && (
        <p className={`mensaje ${tipoMensaje}`}>{mensaje}</p>
      )}

      {actividadFormOpen && (
        <AdminFormModal
          title={editingId ? 'Editar actividad' : 'Crear actividad'}
          description={editingId
            ? 'Actualiza los datos de la actividad seleccionada.'
            : 'Completa los datos para agregar una nueva actividad.'}
          onClose={handleCancelEditActividad}
        >
          {mensaje && <p className={`mensaje ${tipoMensaje} modal-form-feedback`}>{mensaje}</p>}
          <form onSubmit={handleSubmitActividad} className="actividad-form">
            <label className="actividad-field" htmlFor="actividad-nombre">
              <span>Nombre</span>
              <input
                id="actividad-nombre"
                type="text"
                placeholder="Nombre de la actividad"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </label>
            <label className="actividad-field actividad-description-field" htmlFor="actividad-descripcion">
              <span>Descripción</span>
              <textarea
                id="actividad-descripcion"
                placeholder="Describe la actividad"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              ></textarea>
            </label>
            <label className="actividad-field" htmlFor="actividad-ubicacion">
              <span>Sede</span>
              <select
                id="actividad-ubicacion"
                value={form.ubicacion_id}
                onChange={(e) => setForm({ ...form, ubicacion_id: e.target.value })}
              >
                <option value="">Selecciona sede</option>
                {ubicaciones.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} - {u.ciudad}
                  </option>
                ))}
              </select>
            </label>
            <div className="actividad-upload-field">
              <span className="actividad-upload-title">Foto de actividad</span>
              <input
                ref={fotoInputRef}
                id="actividad-foto"
                name="foto"
                type="file"
                className="actividad-file-input"
                onChange={(e) => {
                  const archivo = e.target.files?.[0] || null;
                  setFoto(archivo);
                  setNombreFoto(archivo?.name || 'Ningún archivo seleccionado');
                }}
              />
              <label htmlFor="actividad-foto" className="actividad-file-label">
                <i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
                Seleccionar foto
              </label>
              <span className="actividad-file-name">{nombreFoto}</span>
              <span className="actividad-upload-hint">
                {editingId
                  ? 'Si no eliges otra imagen, se conservará la foto actual.'
                  : 'Elige una imagen para identificar esta actividad.'}
              </span>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId && <i className="fa-solid fa-floppy-disk form-save-icon" aria-hidden="true"></i>}
                {editingId ? 'Guardar cambios' : 'Crear actividad'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancelEditActividad}>
                Cancelar
              </button>
            </div>
          </form>
        </AdminFormModal>
      )}

      {/* Tabla de actividades */}
      <section className="actividades-filtros" aria-label="Buscar y filtrar actividades">
        <input
          type="search"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar por nombre"
          aria-label="Buscar actividades por nombre"
        />
        <select
          value={filtroUbicacion}
          onChange={(event) => setFiltroUbicacion(event.target.value)}
          aria-label="Filtrar por sede"
        >
          <option value="">Todas las sedes</option>
          {ubicacionesFiltro.map((ubicacion) => (
            <option key={ubicacion.id} value={ubicacion.id}>
              {[ubicacion.nombre, ubicacion.ciudad].filter(Boolean).join(' - ')}
            </option>
          ))}
        </select>
        <select
          value={filtroEstado}
          onChange={(event) => setFiltroEstado(event.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="activas">Activas</option>
          <option value="inactivas">Inactivas</option>
        </select>
        <button
          type="button"
          className="actividades-filtros-limpiar"
          onClick={() => {
            setBusqueda('');
            setFiltroUbicacion('');
            setFiltroEstado('activas');
          }}
        >
          Limpiar filtros
        </button>
        <span className="actividades-resultados">
          {actividadesFiltradas.length} actividades
        </span>
      </section>
      <div className="actividades-table-container">
        <table className="actividades-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Sede</th>
              <th>Foto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actividadesPagina.map(a => (
              <tr key={a.id}>
                <td>{a.nombre}</td>
                <td>{a.descripcion}</td>
                <td>
                  {a.ubicacion_nombre
                    ? [a.ubicacion_nombre, a.ubicacion_ciudad].filter(Boolean).join(' - ')
                    : 'Sin sede'}
                </td>
                <td>
                  <img
                    src={a.foto ? `${API_LOCAL}${a.foto}` : defaultImagen}
                    alt={a.nombre}
                    width="60"
                    height="60"
                    style={{ objectFit: 'cover', borderRadius: 6 }}
                  />
                </td>
                <td>{a.eliminado ? 'Inactiva' : 'Activa'}</td>
                <td>
                  {!a.eliminado && (
                    <>
                      <button
                        type="button"
                        className="actividad-action-button actividad-action-edit"
                        onClick={() => handleEditActividad(a)}
                        title={`Editar actividad ${a.nombre}`}
                        aria-label={`Editar actividad ${a.nombre}`}
                      >
                        <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        className="actividad-action-button actividad-action-disable"
                        onClick={() => setActividadParaInactivar(a)}
                        title={`Cambiar a inactiva la actividad ${a.nombre}`}
                        aria-label={`Cambiar a inactiva la actividad ${a.nombre}`}
                      >
                        <i className="fa-solid fa-ban" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        className="actividad-action-button actividad-action-view"
                        onClick={() => handleViewTurnos(a)}
                        title={`Ver turnos de ${a.nombre}`}
                        aria-label={`Ver turnos de ${a.nombre}`}
                      >
                        <i className="fa-solid fa-calendar-days" aria-hidden="true"></i>
                      </button>
                    </>
                  )}
                  {a.eliminado ? (
                    <button
                      type="button"
                      className="actividad-action-button actividad-action-enable"
                      onClick={() => handleActivarActividad(a.id)}
                      title={`Activar actividad ${a.nombre}`}
                      aria-label={`Activar actividad ${a.nombre}`}
                    >
                      <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
            {actividadesFiltradas.length === 0 && (
              <tr>
                <td colSpan="6" className="actividades-sin-resultados">
                  No se encontraron actividades con esos criterios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagination {...paginacionActividades} />

      {actividadParaInactivar && (
        <div className="actividad-modal-overlay" role="presentation">
          <div
            className="actividad-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmar-inactividad-actividad"
          >
            <h2 id="confirmar-inactividad-actividad">Confirmar cambio a inactivo</h2>
            <p>
              ¿Cambiar la actividad «{actividadParaInactivar.nombre}» a inactiva? La actividad quedará oculta de la lista activa.
            </p>
            <div className="actividad-modal-actions">
              <button onClick={handleConfirmarInactividad} className="btn-danger">
                Sí, cambiar a inactivo
              </button>
              <button onClick={() => setActividadParaInactivar(null)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Turnos de actividad seleccionada */}
      {actividadSeleccionada && (
        <div className="turnos-section">
            <div className="turnos-section-header">
              <h2>Turnos de {actividadSeleccionada.nombre}</h2>
              <button
                type="button"
                className="actividad-open-form-button"
                onClick={handleOpenCreateTurno}
              >
                <i className="fa-solid fa-plus" aria-hidden="true"></i>
                Crear turno
              </button>
            </div>

          {/* Lista de turnos */}
            <nav className="turnos-week-navigation" aria-label="Navegación por semana">
              <button
                type="button"
                className="turnos-week-arrow"
                onClick={() => moverSemanaTurnos(-1)}
                aria-label="Ver semana anterior"
                title="Semana anterior"
              >
                <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
              </button>
              <strong>{etiquetaSemanaTurnos}</strong>
              <button
                type="button"
                className="turnos-week-arrow"
                onClick={() => moverSemanaTurnos(1)}
                aria-label="Ver semana siguiente"
                title="Semana siguiente"
              >
                <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
              </button>
              {!esSemanaActual && (
                <button
                  type="button"
                  className="btn-secondary turnos-week-current"
                  onClick={volverASemanaActual}
                >
                  Esta semana
                </button>
              )}
            </nav>
            <div className="turnos-filtros">
              <label>
                <span>Buscar por día o entrenador</span>
                <input
                  type="search"
                  value={busquedaTurnos}
                  onChange={(event) => setBusquedaTurnos(event.target.value)}
                  placeholder="Ej.: lunes o nombre del entrenador"
                />
              </label>
              <label>
                <span>Asignación de entrenadores</span>
                <select
                  value={filtroEntrenadoresTurnos}
                  onChange={(event) => setFiltroEntrenadoresTurnos(event.target.value)}
                >
                  <option value="todos">Todos los turnos</option>
                  <option value="asignados">Con entrenadores</option>
                  <option value="sin-asignar">Sin entrenadores</option>
                </select>
              </label>
            </div>
            <p className="turnos-resultados">
              Mostrando {turnosFiltrados.length} de {turnosSemana.length} turnos de la semana seleccionada
            </p>
          <ul className="turnos-list">
              {turnosFiltrados.map(t => {
              return (
                <li key={t.id} className="turno-item">
                  <div className="turno-view">
                    <div>
                      <p>
                        <strong>Fecha:</strong>{' '}
                        {new Date(t.fecha).toLocaleString('es-AR', {
                          weekday: 'long',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p><strong>Cupo:</strong> {t.cupo_disponible} / {t.cupo_maximo}</p>
                      <p><strong>Entrenadores:</strong> {t.entrenadores || 'Sin asignar'}</p>
                    </div>
                    <div className="item-actions">
                      <button
                        type="button"
                        className="actividad-action-button actividad-action-edit"
                        onClick={() => startEditTurno(t)}
                        title="Editar turno"
                        aria-label="Editar turno"
                      >
                        <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        className="actividad-action-button actividad-action-delete"
                        onClick={() => handleDeleteTurno(t.id)}
                        title="Eliminar turno"
                        aria-label="Eliminar turno"
                      >
                        <i className="fa-solid fa-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
            {turnosFiltrados.length === 0 && (
              <li className="turnos-vacio">
                {turnosSemana.length === 0
                  ? 'No hay turnos programados para la semana seleccionada.'
                  : 'No hay turnos que coincidan con los filtros.'}
              </li>
            )}
          </ul>
        </div>
      )}

      {turnoFormOpen && actividadSeleccionada && (
        <AdminFormModal
            title="Crear turno"
            description={`Define la fecha, el cupo y los entrenadores para ${actividadSeleccionada.nombre}.`}
            onClose={handleCloseCreateTurno}
        >
            {mensaje && <p className={`mensaje ${tipoMensaje} modal-form-feedback`}>{mensaje}</p>}
            <form onSubmit={handleCreateTurno} className="turno-form">
              <div className="row">
                <div className="col">
                  <label htmlFor="turno-fecha">Fecha y hora</label>
                  <input
                    id="turno-fecha"
                    type="datetime-local"
                    value={turnoForm.fecha}
                    onChange={(e) => setTurnoForm({ ...turnoForm, fecha: e.target.value })}
                    required
                  />
                </div>
                <div className="col">
                  <label htmlFor="turno-cupo">Cupo máximo</label>
                  <input
                    id="turno-cupo"
                    type="number"
                    min="1"
                    value={turnoForm.cupo_maximo}
                    onChange={(e) => setTurnoForm({ ...turnoForm, cupo_maximo: e.target.value })}
                    required
                  />
                </div>
              </div>
              <fieldset className="turno-entrenadores">
                <legend>Entrenadores del turno</legend>
                <p>Un empleado no puede quedar asignado a turnos que se superpongan dentro del bloque de dos horas.</p>
                <div className="turno-entrenadores-list">
                  {empleadosParaFormulario(turnoForm.entrenadores).map((empleado) => {
                    const seleccionado = turnoForm.entrenadores.includes(Number(empleado.id));
                    const mismaSede = String(empleado.ubicacion_id) === String(actividadSeleccionada.ubicacion_id);
                    const activo = empleado.estado === 'activo'
                      && !Number(empleado.eliminado)
                      && mismaSede;
                    return (
                      <label className="turno-entrenador-option" key={empleado.id}>
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          disabled={!activo && !seleccionado}
                          onChange={(event) => cambiarEntrenador(setTurnoForm, empleado.id, event.target.checked)}
                        />
                        <span>
                          {empleado.nombre}
                          {!activo
                            ? seleccionado
                              ? ' (no disponible; desmarca para quitarlo)'
                              : ' (no disponible)'
                            : ''}
                        </span>
                      </label>
                    );
                  })}
                  {empleadosParaFormulario(turnoForm.entrenadores).length === 0 && (
                    <span className="turno-entrenadores-empty">No hay empleados asignables en esta sede.</span>
                  )}
                </div>
              </fieldset>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Crear turno</button>
                <button type="button" className="btn-secondary" onClick={handleCloseCreateTurno}>Cancelar</button>
              </div>
            </form>
        </AdminFormModal>
      )}

      {turnoEditMode && actividadSeleccionada && (
        <AdminFormModal
            title="Editar turno"
            description={`Actualiza la fecha, el cupo o los entrenadores de ${actividadSeleccionada.nombre}.`}
            onClose={cancelEditTurno}
        >
            {mensaje && <p className={`mensaje ${tipoMensaje} modal-form-feedback`}>{mensaje}</p>}
            <form onSubmit={handleUpdateTurno} className="turno-form">
              <div className="row">
                <div className="col">
                  <label htmlFor="turno-editar-fecha">Fecha y hora</label>
                  <input
                    id="turno-editar-fecha"
                    type="datetime-local"
                    value={turnoEditForm.fecha}
                    onChange={(e) => setTurnoEditForm({ ...turnoEditForm, fecha: e.target.value })}
                    required
                  />
                </div>
                <div className="col">
                  <label htmlFor="turno-editar-cupo">Cupo máximo</label>
                  <input
                    id="turno-editar-cupo"
                    type="number"
                    min="1"
                    value={turnoEditForm.cupo_maximo}
                    onChange={(e) => setTurnoEditForm({ ...turnoEditForm, cupo_maximo: e.target.value })}
                    required
                  />
                </div>
              </div>
              <fieldset className="turno-entrenadores">
                <legend>Entrenadores del turno</legend>
                <p>Un empleado no puede quedar asignado a turnos que se superpongan dentro del bloque de dos horas.</p>
                <div className="turno-entrenadores-list">
                  {empleadosParaFormulario(turnoEditForm.entrenadores).map((empleado) => {
                    const seleccionado = turnoEditForm.entrenadores.includes(Number(empleado.id));
                    const mismaSede = String(empleado.ubicacion_id) === String(actividadSeleccionada.ubicacion_id);
                    const activo = empleado.estado === 'activo'
                      && !Number(empleado.eliminado)
                      && mismaSede;
                    return (
                      <label className="turno-entrenador-option" key={empleado.id}>
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          disabled={!activo && !seleccionado}
                          onChange={(event) => cambiarEntrenador(setTurnoEditForm, empleado.id, event.target.checked)}
                        />
                        <span>
                          {empleado.nombre}
                          {!activo
                            ? seleccionado
                              ? ' (no disponible; desmarca para quitarlo)'
                              : ' (no disponible)'
                            : ''}
                        </span>
                      </label>
                    );
                  })}
                  {empleadosParaFormulario(turnoEditForm.entrenadores).length === 0 && (
                    <span className="turno-entrenadores-empty">No hay empleados asignables en esta sede.</span>
                  )}
                </div>
              </fieldset>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Guardar cambios</button>
                <button type="button" className="btn-secondary" onClick={cancelEditTurno}>Cancelar</button>
              </div>
            </form>
        </AdminFormModal>
      )}
    </div>
  );
}

export default ActividadesAdmin;
