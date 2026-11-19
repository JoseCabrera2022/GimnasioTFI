import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/UbicacionesAdmin.css';
import AdminFormModal from '../components/AdminFormModal';

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
  const [formModalOpen, setFormModalOpen] = useState(false);
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

  const resetFormUbicacion = () => {
    setFormUbicacion({
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
  };

  const handleCreate = () => {
    resetFormUbicacion();
    setEditId(null);
    setMensaje('');
    setFormModalOpen(true);
  };

  const handleCancelForm = () => {
    resetFormUbicacion();
    setEditId(null);
    setFormModalOpen(false);
  };

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
      resetFormUbicacion();
      setEditId(null);
      setFormModalOpen(false);
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
    setMensaje('');
    setFormModalOpen(true);
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
      <header className="ubicaciones-admin-header">
        <h1>Gestión de Ubicaciones</h1>
        <button type="button" className="ubicacion-open-form-button" onClick={handleCreate}>
          <i className="fa-solid fa-circle-plus" aria-hidden="true"></i>
          Crear ubicación
        </button>
      </header>
      {mensaje && !formModalOpen && <p className="alerta">{mensaje}</p>}

      {formModalOpen && (
        <AdminFormModal
          title={editId ? 'Editar ubicación' : 'Crear ubicación'}
          description={editId
            ? 'Actualiza los datos de esta sede.'
            : 'Completa los datos para agregar una sede al gimnasio.'}
          onClose={handleCancelForm}
        >
          {mensaje && <p className="alerta modal-form-feedback">{mensaje}</p>}
          <form onSubmit={handleSubmit} className="ubicacion-form">
            <label className="ubicacion-field">
              <span>Nombre</span>
              <input type="text" placeholder="Nombre" value={formUbicacion.nombre}
                onChange={(e) => setFormUbicacion({ ...formUbicacion, nombre: e.target.value })} />
            </label>
            <label className="ubicacion-field">
              <span>Dirección</span>
              <input type="text" placeholder="Dirección" value={formUbicacion.direccion}
                onChange={(e) => setFormUbicacion({ ...formUbicacion, direccion: e.target.value })} />
            </label>
            <label className="ubicacion-field">
              <span>Ciudad</span>
              <input type="text" placeholder="Ciudad" value={formUbicacion.ciudad}
                onChange={(e) => setFormUbicacion({ ...formUbicacion, ciudad: e.target.value })} />
            </label>
            <label className="ubicacion-field">
              <span>Provincia</span>
              <input type="text" placeholder="Provincia" value={formUbicacion.provincia}
                onChange={(e) => setFormUbicacion({ ...formUbicacion, provincia: e.target.value })} />
            </label>
            <label className="ubicacion-field">
              <span>País</span>
              <input type="text" placeholder="País" value={formUbicacion.pais}
                onChange={(e) => setFormUbicacion({ ...formUbicacion, pais: e.target.value })} />
            </label>
            <label className="ubicacion-field">
              <span>Teléfono</span>
              <input type="text" placeholder="Teléfono" value={formUbicacion.telefono}
                onChange={(e) => setFormUbicacion({ ...formUbicacion, telefono: e.target.value })} />
            </label>
            <label className="ubicacion-field">
              <span>Correo electrónico</span>
              <input type="email" placeholder="Email" value={formUbicacion.email}
                onChange={(e) => setFormUbicacion({ ...formUbicacion, email: e.target.value })} />
            </label>
            <label className="ubicacion-field">
              <span>Latitud</span>
              <input type="number" step="0.000001" placeholder="Latitud" value={formUbicacion.lat}
                onChange={(e) => setFormUbicacion({ ...formUbicacion, lat: e.target.value })} />
            </label>
            <label className="ubicacion-field">
              <span>Longitud</span>
              <input type="number" step="0.000001" placeholder="Longitud" value={formUbicacion.lng}
                onChange={(e) => setFormUbicacion({ ...formUbicacion, lng: e.target.value })} />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editId && <i className="fa-solid fa-floppy-disk form-save-icon" aria-hidden="true"></i>}
                {editId ? 'Guardar cambios' : 'Crear ubicación'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancelForm}>
                Cancelar
              </button>
            </div>
          </form>
        </AdminFormModal>
      )}

      {/* Tabla */}
      <label className="ubicaciones-inactive-toggle">
        <input
          type="checkbox"
          checked={mostrarInactivas}
          onChange={(event) => setMostrarInactivas(event.target.checked)}
        />
        Mostrar ubicaciones inactivas
      </label>
      <div className="ubicaciones-table-container">
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
                      <button
                        type="button"
                        className="ubicacion-action-button ubicacion-action-edit"
                        onClick={() => handleEdit(u)}
                        title={`Editar ubicación ${u.nombre}`}
                        aria-label={`Editar ubicación ${u.nombre}`}
                      >
                        <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        className="ubicacion-action-button ubicacion-action-disable"
                        onClick={() => confirmDelete(u.id)}
                        title={`Cambiar a inactiva la ubicación ${u.nombre}`}
                        aria-label={`Cambiar a inactiva la ubicación ${u.nombre}`}
                      >
                        <i className="fa-solid fa-ban" aria-hidden="true"></i>
                      </button>
                    </>
                  )}
                  {u.eliminado ? (
                    <button
                      type="button"
                      className="ubicacion-action-button ubicacion-action-enable"
                      onClick={() => handleActivar(u.id)}
                      title={`Activar ubicación ${u.nombre}`}
                      aria-label={`Activar ubicación ${u.nombre}`}
                    >
                      <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
