import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { ENDPOINTS_LOCAL, API_LOCAL } from '../api/endpoints';
import defaultImagen from '/assets/fuerzavitalgym.png';
import '../styles/ActividadesAdmin.css';

function ActividadesAdmin() {
  const { token } = useAuthStore();
  const [actividades, setActividades] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);

  // Form actividad
  const [form, setForm] = useState({ nombre: '', descripcion: '', ubicacion_id: '' });
  const [foto, setFoto] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Mensajes
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState(''); // 'success' | 'error'

  // Turnos
  const [turnos, setTurnos] = useState([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);

  // Form crear turno
  const [turnoForm, setTurnoForm] = useState({ fecha: '', cupo_maximo: '' });

  // Form editar turno
  const [turnoEditMode, setTurnoEditMode] = useState(null); // turno id que se edita
  const [turnoEditForm, setTurnoEditForm] = useState({ fecha: '', cupo_maximo: '' });

  // Cargar actividades
  const fetchActividades = async () => {
    try {
      const res = await axios.get(ENDPOINTS_LOCAL.ACTIVIDADES_SIMPLE ?? `${ENDPOINTS_LOCAL.ACTIVIDADES}-simple`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActividades(res.data);
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al cargar actividades');
    }
  };

  // Cargar ubicaciones
  const fetchUbicaciones = async () => {
    try {
      const res = await axios.get(ENDPOINTS_LOCAL.UBICACIONES);
      setUbicaciones(res.data);
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
    }
  };

  useEffect(() => {
    fetchActividades();
    fetchUbicaciones();
  }, []);

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
      setFoto(null);
      setEditingId(null);
      fetchActividades();
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al guardar actividad');
    }
  };

  // Editar actividad
  const handleEditActividad = (actividad) => {
    setForm({
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
      ubicacion_id: actividad.ubicacion_id
    });
    setEditingId(actividad.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edición actividad
  const handleCancelEditActividad = () => {
    setForm({ nombre: '', descripcion: '', ubicacion_id: '' });
    setFoto(null);
    setEditingId(null);
  };

  // Eliminar actividad
  const handleDeleteActividad = async (id) => {
    try {
      await axios.delete(`${ENDPOINTS_LOCAL.ACTIVIDADES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTipoMensaje('success');
      setMensaje('Actividad eliminada con éxito');
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

  // Ver turnos de una actividad
  const handleViewTurnos = async (actividad) => {
    try {
      const res = await axios.get(`${ENDPOINTS_LOCAL.ACTIVIDADES}/${actividad.id}/turnos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTurnos(res.data);
      setActividadSeleccionada(actividad);
      setTurnoForm({ fecha: '', cupo_maximo: '' });
      setTurnoEditMode(null);
      setTurnoEditForm({ fecha: '', cupo_maximo: '' });
      // Scroll a sección turnos
      const el = document.querySelector('.turnos-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al obtener turnos');
    }
  };

  // Crear turno
  const handleCreateTurno = async (e) => {
    e.preventDefault();
    setMensaje('');
    setTipoMensaje('');

    if (!actividadSeleccionada) return;
    const { fecha, cupo_maximo } = turnoForm;
    if (!fecha || !cupo_maximo) {
      setTipoMensaje('error');
      setMensaje('Fecha y cupo máximo son obligatorios');
      return;
    }

    try {
      await axios.post(ENDPOINTS_LOCAL.TURNOS, {
        actividad_id: actividadSeleccionada.id,
        fecha,
        cupo_maximo: Number(cupo_maximo)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTipoMensaje('success');
      setMensaje('Turno creado con éxito');
      await handleViewTurnos(actividadSeleccionada);
      setTurnoForm({ fecha: '', cupo_maximo: '' });
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al crear turno');
    }
  };

  // Iniciar edición de turno
  const startEditTurno = (turno) => {
    setTurnoEditMode(turno.id);
    // Normalizar fecha a input datetime-local si viene en ISO completo
    const dt = new Date(turno.fecha);
    const localISO = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setTurnoEditForm({
      fecha: localISO,
      cupo_maximo: turno.cupo_maximo
    });
  };

  // Cancelar edición de turno
  const cancelEditTurno = () => {
    setTurnoEditMode(null);
    setTurnoEditForm({ fecha: '', cupo_maximo: '' });
  };

  // Guardar edición turno
  const handleUpdateTurno = async (e) => {
    e.preventDefault();
    setMensaje('');
    setTipoMensaje('');

    if (!turnoEditMode) return;
    const { fecha, cupo_maximo } = turnoEditForm;
    if (!fecha || !cupo_maximo) {
      setTipoMensaje('error');
      setMensaje('Fecha y cupo máximo son obligatorios');
      return;
    }

    try {
      await axios.put(`${ENDPOINTS_LOCAL.TURNOS}/${turnoEditMode}`, {
        fecha,
        cupo_maximo: Number(cupo_maximo)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTipoMensaje('success');
      setMensaje('Turno actualizado con éxito');
      await handleViewTurnos(actividadSeleccionada);
      cancelEditTurno();
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

  return (
    <div className="actividades-admin">
      <h1>Gestión de Actividades y Turnos</h1>

      {mensaje && <p className={`mensaje ${tipoMensaje}`}>{mensaje}</p>}

      {/* Formulario de actividad */}
      <form onSubmit={handleSubmitActividad} className="actividad-form">
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
        <textarea
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        ></textarea>
        <select
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
        <input type="file" onChange={(e) => setFoto(e.target.files[0])} />
        <div className="form-actions">
          <button type="submit">{editingId ? 'Actualizar' : 'Crear'} Actividad</button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={handleCancelEditActividad}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {/* Tabla de actividades */}
      <table className="actividades-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Sede</th>
            <th>Foto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {actividades.map(a => (
            <tr key={a.id}>
              <td>{a.nombre}</td>
              <td>{a.descripcion}</td>
              <td>{a.ubicacion_id}</td>
              <td>
                <img
                  src={a.foto ? `${API_LOCAL}${a.foto}` : defaultImagen}
                  alt={a.nombre}
                  width="60"
                  height="60"
                  style={{ objectFit: 'cover', borderRadius: 6 }}
                />
              </td>
              <td>
                <button onClick={() => handleEditActividad(a)}>Editar</button>
                <button onClick={() => handleDeleteActividad(a.id)} className="btn-danger">Eliminar</button>
                <button onClick={() => handleViewTurnos(a)} className="btn-primary">Ver Turnos</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Turnos de actividad seleccionada */}
      {actividadSeleccionada && (
        <div className="turnos-section">
          <h2>Turnos de {actividadSeleccionada.nombre}</h2>

          {/* Crear turno */}
          <form onSubmit={handleCreateTurno} className="turno-form">
            <div className="row">
              <div className="col">
                <label>Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={turnoForm.fecha}
                  onChange={(e) => setTurnoForm({ ...turnoForm, fecha: e.target.value })}
                />
              </div>
              <div className="col">
                <label>Cupo máximo</label>
                <input
                  type="number"
                  min="1"
                  value={turnoForm.cupo_maximo}
                  onChange={(e) => setTurnoForm({ ...turnoForm, cupo_maximo: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">Crear turno</button>
          </form>

          {/* Lista de turnos */}
          <ul className="turnos-list">
            {turnos.map(t => {
              const isEditing = turnoEditMode === t.id;
              return (
                <li key={t.id} className="turno-item">
                  {!isEditing ? (
                    <div className="turno-view">
                      <p><strong>Fecha:</strong> {new Date(t.fecha).toLocaleString()}</p>
                      <p><strong>Cupo:</strong> {t.cupo_disponible} / {t.cupo_maximo}</p>
                      <div className="item-actions">
                        <button onClick={() => startEditTurno(t)}>Editar</button>
                        <button onClick={() => handleDeleteTurno(t.id)} className="btn-danger">Eliminar</button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateTurno} className="turno-edit-form">
                      <div className="row">
                        <div className="col">
                          <label>Fecha y hora</label>
                          <input
                            type="datetime-local"
                            value={turnoEditForm.fecha}
                            onChange={(e) => setTurnoEditForm({ ...turnoEditForm, fecha: e.target.value })}
                          />
                        </div>
                        <div className="col">
                          <label>Cupo máximo</label>
                          <input
                            type="number"
                            min="1"
                            value={turnoEditForm.cupo_maximo}
                            onChange={(e) => setTurnoEditForm({ ...turnoEditForm, cupo_maximo: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn-primary">Guardar</button>
                        <button type="button" className="btn-secondary" onClick={cancelEditTurno}>Cancelar</button>
                      </div>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ActividadesAdmin;
