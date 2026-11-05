import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/UbicacionesAdmin.css';

function UbicacionesAdmin() {
  const { token } = useAuthStore();
  const [ubicaciones, setUbicaciones] = useState([]);
  const [formUbicacion, setFormUbicacion] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    pais: '',
    telefono: '',
    email: '',
    lat: '',
    lng: ''
  });
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [mostrarInactivas, setMostrarInactivas] = useState(false);

  // Modal de confirmación
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const url = `${ENDPOINTS_LOCAL.UBICACIONES}${mostrarInactivas ? '?soloInactivas=true' : ''}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUbicaciones(res.data);
    } catch {
      setMensaje('Error al cargar ubicaciones');
    }
  }, [token, mostrarInactivas]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formUbicacion.nombre || !formUbicacion.direccion || !formUbicacion.ciudad || !formUbicacion.provincia || !formUbicacion.pais) {
      setMensaje('Nombre, dirección, ciudad, provincia y país son obligatorios');
      return;
    }
    try {
      if (editId) {
        await axios.put(`${ENDPOINTS_LOCAL.UBICACIONES}/${editId}`, formUbicacion, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Ubicación actualizada');
      } else {
        await axios.post(ENDPOINTS_LOCAL.UBICACIONES, formUbicacion, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Ubicación creada');
      }
      setFormUbicacion({ nombre: '', direccion: '', ciudad: '', provincia: '', pais: '', telefono: '', email: '', lat: '', lng: '' });
      setEditId(null);
      fetchData();
    } catch {
      setMensaje('Error al guardar ubicación');
    }
  };

  const handleEdit = (ubicacion) => {
    setFormUbicacion({
      nombre: ubicacion.nombre,
      direccion: ubicacion.direccion,
      ciudad: ubicacion.ciudad,
      provincia: ubicacion.provincia,
      pais: ubicacion.pais,
      telefono: ubicacion.telefono || '',
      email: ubicacion.email || '',
      lat: ubicacion.lat || '',
      lng: ubicacion.lng || ''
    });
    setEditId(ubicacion.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${ENDPOINTS_LOCAL.UBICACIONES}/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje('Ubicación cambiada a inactiva; puedes consultarla en la lista de inactivas');
      fetchData();
    } catch {
      setMensaje('Error al eliminar ubicación');
    }
    setShowModal(false);
    setDeleteId(null);
  };

  const handleActivar = async (id) => {
    try {
      await axios.patch(`${ENDPOINTS_LOCAL.UBICACIONES}/${id}/activar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje('Ubicación activada');
      fetchData();
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al activar ubicación');
    }
  };

  return (
    <div className="ubicaciones-admin">
      <h1>Gestión de Ubicaciones</h1>
      {mensaje && <p className="alerta">{mensaje}</p>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="ubicacion-form">
        <h2>{editId ? 'Editar Ubicación' : 'Crear Ubicación'}</h2>
        <input type="text" placeholder="Nombre" value={formUbicacion.nombre}
          onChange={(e) => setFormUbicacion({ ...formUbicacion, nombre: e.target.value })} />
        <input type="text" placeholder="Dirección" value={formUbicacion.direccion}
          onChange={(e) => setFormUbicacion({ ...formUbicacion, direccion: e.target.value })} />
        <input type="text" placeholder="Ciudad" value={formUbicacion.ciudad}
          onChange={(e) => setFormUbicacion({ ...formUbicacion, ciudad: e.target.value })} />
        <input type="text" placeholder="Provincia" value={formUbicacion.provincia}
          onChange={(e) => setFormUbicacion({ ...formUbicacion, provincia: e.target.value })} />
        <input type="text" placeholder="País" value={formUbicacion.pais}
          onChange={(e) => setFormUbicacion({ ...formUbicacion, pais: e.target.value })} />
        <input type="text" placeholder="Teléfono" value={formUbicacion.telefono}
          onChange={(e) => setFormUbicacion({ ...formUbicacion, telefono: e.target.value })} />
        <input type="email" placeholder="Email" value={formUbicacion.email}
          onChange={(e) => setFormUbicacion({ ...formUbicacion, email: e.target.value })} />
        <input type="number" step="0.000001" placeholder="Latitud" value={formUbicacion.lat}
          onChange={(e) => setFormUbicacion({ ...formUbicacion, lat: e.target.value })} />
        <input type="number" step="0.000001" placeholder="Longitud" value={formUbicacion.lng}
          onChange={(e) => setFormUbicacion({ ...formUbicacion, lng: e.target.value })} />
        <div className="form-actions">
          <button type="submit" className="btn-primary">{editId ? 'Actualizar' : 'Crear'} Ubicación</button>
          {editId && (
            <button type="button" className="btn-secondary" onClick={() => {
              setFormUbicacion({ nombre: '', direccion: '', ciudad: '', provincia: '', pais: '', telefono: '', email: '', lat: '', lng: '' });
              setEditId(null);
            }}>Cancelar</button>
          )}
        </div>
      </form>

      {/* Tabla */}
      <label>
        <input
          type="checkbox"
          checked={mostrarInactivas}
          onChange={(event) => setMostrarInactivas(event.target.checked)}
        />
        Mostrar ubicaciones inactivas
      </label>
      <table className="ubicaciones-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Ciudad</th>
            <th>Provincia</th>
            <th>País</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Lat</th>
            <th>Lng</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ubicaciones.map((u) => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.direccion}</td>
              <td>{u.ciudad}</td>
              <td>{u.provincia}</td>
              <td>{u.pais}</td>
              <td>{u.telefono}</td>
              <td>{u.email}</td>
              <td>{u.lat}</td>
              <td>{u.lng}</td>
              <td>{u.eliminado ? 'Inactiva' : 'Activa'}</td>
              <td>
                {!u.eliminado && (
                  <>
                    <button onClick={() => handleEdit(u)} className="btn-secondary">Editar</button>
                    <button onClick={() => confirmDelete(u.id)} className="btn-danger">Cambiar a inactivo</button>
                  </>
                )}
                {u.eliminado ? (
                  <button onClick={() => handleActivar(u.id)} className="btn-primary">
                    Cambiar a activo
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal de confirmación */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>¿Seguro que quieres cambiar esta ubicación a inactiva? Quedará oculta de la lista activa.</h3>
            <div className="modal-actions">
              <button onClick={handleDelete} className="btn-danger">Sí, cambiar a inactivo</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UbicacionesAdmin;
