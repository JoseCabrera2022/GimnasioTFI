import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/Usuarios.css';
import { API_LOCAL, ENDPOINTS_LOCAL } from '../api/endpoints';
import defaultAvatar from '../assets/default-avatar.png';
import SelectorUbicacion from '../components/SelectorUbicacion';

function Usuarios() {
  const { token } = useAuthStore();
  const [usuarios, setUsuarios] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    correo_electronico: '',
    telefono: '',
    rol: 'socio',
    estado: 'activo',
    ubicacion_id: '',
    password: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
  const [preview, setPreview] = useState(null)
  const [editMode, setEditMode] = useState(false);
  const [fileName, setFileName] = useState('Ningún archivo seleccionado');

  // Cargar usuarios
  const fetchUsuarios = useCallback(async () => {
    try {
      const url = `${ENDPOINTS_LOCAL.USUARIOS}${mostrarInactivos ? '?soloInactivos=true' : ''}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data);
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al cargar usuarios');
    }
  }, [mostrarInactivos, token]);

  const handleView = async (id) => {
    try {
      const res = await axios.get(`${ENDPOINTS_LOCAL.USUARIOS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerfilSeleccionado(res.data); // nuevo estado
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al obtener perfil');
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
    fetchUsuarios();
    fetchUbicaciones();
  }, [fetchUsuarios]);

  // Validaciones
  const validateForm = () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.correo_electronico.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.correo_electronico = 'Correo inválido';
    if (form.telefono && !form.telefono.match(/^\d{7,15}$/)) newErrors.telefono = 'Teléfono inválido';
    if (!editingId && form.password.length < 3) newErrors.password = 'La contraseña debe tener al menos 3 caracteres';
    if (!form.ubicacion_id) newErrors.ubicacion_id = 'Selecciona una sede';
    if (!['socio','empleado','admin'].includes(form.rol)) newErrors.rol = 'Rol inválido';
    if (!['activo','inactivo'].includes(form.estado)) newErrors.estado = 'Estado inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Crear o actualizar usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    if (!validateForm()) return;

    try {
      if (editingId) {
        await axios.put(`${ENDPOINTS_LOCAL.USUARIOS}/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Usuario actualizado con éxito');
      } else {
        await axios.post(ENDPOINTS_LOCAL.USUARIOS, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Usuario creado con éxito');
      }
      setForm({
        nombre: '',
        correo_electronico: '',
        telefono: '',
        rol: 'socio',
        estado: 'activo',
        ubicacion_id: '',
        password: ''
      });
      setEditingId(null);
      fetchUsuarios();
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al guardar usuario');
    }
  };

  // Editar usuario
  const handleEdit = (usuario) => {
    setForm({
      nombre: usuario.nombre,
      correo_electronico: usuario.correo_electronico,
      telefono: usuario.telefono || '',
      rol: usuario.rol,
      estado: usuario.estado,
      ubicacion_id: usuario.ubicacion_id,
      password: '' // no se muestra la contraseña
    });
    setEditingId(usuario.id);
  };

  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('ubicacion_id', perfilSeleccionado.ubicacion_id);

    try {
      await axios.put(`${ENDPOINTS_LOCAL.USUARIOS}/${perfilSeleccionado.id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const refreshed = await axios.get(`${ENDPOINTS_LOCAL.USUARIOS}/${perfilSeleccionado.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerfilSeleccionado(refreshed.data);
      setEditMode(false);
      setPreview(null);
      fetchUsuarios(); // refrescar tabla
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al actualizar perfil');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
    } else {
      setFileName('Ningún archivo seleccionado');
      setPreview(null);
    }
  };

  // Abrir confirmación para cambiar al usuario a inactivo
  const handleDeleteClick = (usuario) => {
    setConfirmDelete({ id: usuario.id, nombre: usuario.nombre });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      await axios.delete(`${ENDPOINTS_LOCAL.USUARIOS}/${confirmDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje('Usuario cambiado a inactivo; puedes consultarlo en la lista de inactivos');
      setConfirmDelete(null);
      fetchUsuarios();
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al cambiar usuario a inactivo');
      setConfirmDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleActivarUsuario = async (id) => {
    try {
      await axios.patch(`${ENDPOINTS_LOCAL.USUARIOS}/${id}/activar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje('Usuario activado');
      fetchUsuarios();
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al activar usuario');
    }
  };

  return (
    <div className="usuarios-page">
      <h1>Gestión de Usuarios</h1>
      {mensaje && <p className="mensaje">{mensaje}</p>}
      <label className="usuarios-toggle-eliminados">
        <input
          type="checkbox"
          checked={mostrarInactivos}
          onChange={(event) => {
            setMostrarInactivos(event.target.checked);
          }}
        />
        Mostrar usuarios inactivos
      </label>

      <form onSubmit={handleSubmit} className="usuario-form">
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
        {errors.nombre && <span className="error">{errors.nombre}</span>}

        <input
          type="email"
          placeholder="Correo electrónico"
          value={form.correo_electronico}
          onChange={(e) => setForm({ ...form, correo_electronico: e.target.value })}
        />
        {errors.correo_electronico && <span className="error">{errors.correo_electronico}</span>}

        <input
          type="text"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        />
        {errors.telefono && <span className="error">{errors.telefono}</span>}

        <select
          value={form.rol}
          onChange={(e) => setForm({ ...form, rol: e.target.value })}
        >
          <option value="socio">Socio</option>
          <option value="empleado">Empleado</option>
          <option value="admin">Admin</option>
        </select>
        {errors.rol && <span className="error">{errors.rol}</span>}

        <select
          value={form.estado}
          onChange={(e) => setForm({ ...form, estado: e.target.value })}
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        {errors.estado && <span className="error">{errors.estado}</span>}

        <select
          className="usuarios-ubicacion-select"
          value={form.ubicacion_id}
          onChange={(e) => setForm({ ...form, ubicacion_id: e.target.value })}
        >
          <option value="">Selecciona una sede</option>
          {ubicaciones.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre} - {u.ciudad}
            </option>
          ))}
        </select>
        {errors.ubicacion_id && <span className="error">{errors.ubicacion_id}</span>}

        {!editingId && (
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        )}
        {errors.password && <span className="error">{errors.password}</span>}

        <button className="btn-crear-editar" type="submit">{editingId ? 'Actualizar' : 'Crear'} Usuario</button>
        {editingId && (
          <button
            type="button"
            className="btn-cancel-edit"
            onClick={() => {
              setForm({
                nombre: '',
                correo_electronico: '',
                telefono: '',
                rol: 'socio',
                estado: 'activo',
                ubicacion_id: '',
                password: ''
              });
              setEditingId(null);
              setErrors({});
            }}
          >
            Cancelar edición
          </button>
        )}
      </form>

      <div className="usuarios-table-container">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Ubicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(usuarios) && usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nombre}</td>
                <td>{u.correo_electronico}</td>
                <td>{u.telefono}</td>
                <td>{u.rol}</td>
                <td>{u.eliminado ? 'Inactivo' : u.estado}</td>
                <td>{u.ubicacion_id}</td>
                <td>
                  {!u.eliminado && (
                    <>
                      <button onClick={() => handleEdit(u)}>Editar</button>
                      <button onClick={() => handleView(u.id)}>Ver perfil</button>
                      <button className="btn-soft-delete" onClick={() => handleDeleteClick(u)}>
                        Cambiar a inactivo
                      </button>
                    </>
                  )}
                  {u.eliminado && (
                    <button className="btn-confirm" onClick={() => handleActivarUsuario(u.id)}>
                      Cambiar a activo
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {perfilSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content perfil-modal">
            <h2>Perfil de {perfilSeleccionado.nombre}</h2>
            <div className="perfil-card">
              <img
                src={preview ? preview : perfilSeleccionado.foto ? `${API_LOCAL}${perfilSeleccionado.foto}` : defaultAvatar}
                alt="avatar"
                className="perfil-avatar"
              />

              {!editMode ? (
                <div className="perfil-info">
                  <p><strong>Nombre:</strong> {perfilSeleccionado.nombre}</p>
                  <p><strong>Correo:</strong> {perfilSeleccionado.correo_electronico}</p>
                  {perfilSeleccionado.telefono && <p><strong>Teléfono:</strong> {perfilSeleccionado.telefono}</p>}
                  {perfilSeleccionado.rol && <p><strong>Rol:</strong> {perfilSeleccionado.rol}</p>}
                  {perfilSeleccionado.ubicacion_id && (
                    <p><strong>Sede:</strong> {perfilSeleccionado.ubicacion_id}</p>
                  )}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => setEditMode(true)} className="perfil-button">Editar</button>
                    <button onClick={() => setPerfilSeleccionado(null)} className="cancel-button">Cerrar</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdatePerfil} className="perfil-info">
                  <input type="text" name="nombre" defaultValue={perfilSeleccionado.nombre} />
                  {errors.nombre && <span className="error">{errors.nombre}</span>}

                  <input type="email" name="correo_electronico" defaultValue={perfilSeleccionado.correo_electronico} />
                  {errors.correo_electronico && <span className="error">{errors.correo_electronico}</span>}

                  <input type="text" name="telefono" defaultValue={perfilSeleccionado.telefono || ''} />
                  {errors.telefono && <span className="error">{errors.telefono}</span>}

                  <input type="file" id="foto" name="foto" className="file-input" onChange={handleFileChange} />

                  <SelectorUbicacion
                    selectedUbicacion={perfilSeleccionado.ubicacion_id}
                    setSelectedUbicacion={(id) => setPerfilSeleccionado({ ...perfilSeleccionado, ubicacion_id: id })}
                  />
                  {errors.ubicacion_id && <span className="error">{errors.ubicacion_id}</span>}

                  {/* 🔹 Select para Rol */}
                  <select name="rol" defaultValue={perfilSeleccionado.rol}>
                    <option value="socio">Socio</option>
                    <option value="empleado">Empleado</option>
                    <option value="admin">Admin</option>
                  </select>

                  {/* 🔹 Select para Estado */}
                  <select name="estado" defaultValue={perfilSeleccionado.estado}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>

                  <label htmlFor="foto" className="file-label">Seleccionar foto</label>
                  <span className="file-name">{fileName}</span>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" className="perfil-button">Guardar cambios</button>
                    <button
                      type="button"
                      onClick={() => { setEditMode(false); setPreview(null); }}
                      className="cancel-button"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 🔹 Modal de confirmación */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar cambio a inactivo</h2>
            <p>
              ¿Cambiar a inactivo a {confirmDelete.nombre}? Quedará oculto de la lista activa y podrás consultarlo en la lista de inactivos.
            </p>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={handleConfirmDelete}>
                Sí, cambiar a inactivo
              </button>
              <button className="btn-cancel" onClick={handleCancelDelete}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
