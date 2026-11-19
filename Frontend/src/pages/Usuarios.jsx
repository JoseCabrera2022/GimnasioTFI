import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/Usuarios.css';
import { API_LOCAL, ENDPOINTS_LOCAL } from '../api/endpoints';
import defaultAvatar from '../assets/default-avatar.png';
import SelectorUbicacion from '../components/SelectorUbicacion';
import AdminFormModal from '../components/AdminFormModal';

const capitalizar = (valor) => valor ? valor.charAt(0).toUpperCase() + valor.slice(1) : '';

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
  const [usuarioFormOpen, setUsuarioFormOpen] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
  const [preview, setPreview] = useState(null)
  const [editMode, setEditMode] = useState(false);
  const [fileName, setFileName] = useState('Ningún archivo seleccionado');
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activo');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [usuariosPorPagina, setUsuariosPorPagina] = useState(10);

  const usuariosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();

    return usuarios.filter((usuario) => {
      const coincideBusqueda = !termino
        || usuario.nombre?.toLocaleLowerCase().includes(termino)
        || usuario.correo_electronico?.toLocaleLowerCase().includes(termino);
      const coincideRol = !filtroRol || usuario.rol === filtroRol;
      const estado = usuario.eliminado ? 'inactivo' : usuario.estado;
      const coincideEstado = !filtroEstado || estado === filtroEstado;
      const coincideUbicacion = !filtroUbicacion
        || String(usuario.ubicacion_id) === filtroUbicacion;

      return coincideBusqueda && coincideRol && coincideEstado && coincideUbicacion;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado, filtroUbicacion]);

  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / usuariosPorPagina));
  const usuariosPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * usuariosPorPagina;
    return usuariosFiltrados.slice(inicio, inicio + usuariosPorPagina);
  }, [usuariosFiltrados, paginaActual, usuariosPorPagina]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroRol, filtroEstado, filtroUbicacion, usuariosPorPagina]);

  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
  }, [paginaActual, totalPaginas]);

  // Cargar usuarios
  const fetchUsuarios = useCallback(async () => {
    try {
      const parametroEstado = filtroEstado === 'inactivo' ? '?soloInactivos=true' : '';
      const res = await axios.get(`${ENDPOINTS_LOCAL.USUARIOS}${parametroEstado}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data);
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al cargar usuarios');
    }
  }, [filtroEstado, token]);

  const handleView = async (id) => {
    try {
      const res = await axios.get(`${ENDPOINTS_LOCAL.USUARIOS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditMode(false);
      setPreview(null);
      setFileName('Ningún archivo seleccionado');
      setPerfilSeleccionado(res.data); // nuevo estado
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al obtener perfil');
    }
  };

  const cerrarPerfil = () => {
    setPerfilSeleccionado(null);
    setEditMode(false);
    setPreview(null);
    setFileName('Ningún archivo seleccionado');
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
      setErrors({});
      setUsuarioFormOpen(false);
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
    setMensaje('');
    setErrors({});
    setUsuarioFormOpen(true);
  };

  const handleCreateUsuario = () => {
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
    setMensaje('');
    setUsuarioFormOpen(true);
  };

  const handleCloseUsuarioForm = () => {
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
    setUsuarioFormOpen(false);
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
      <header className="usuarios-page-header">
        <h1>Gestión de Usuarios</h1>
        <button type="button" className="usuarios-open-form-button" onClick={handleCreateUsuario}>
          <i className="fa-solid fa-user-plus" aria-hidden="true"></i>
          Crear usuario
        </button>
      </header>
      {mensaje && !usuarioFormOpen && <p className="mensaje">{mensaje}</p>}

      {usuarioFormOpen && (
        <AdminFormModal
          title={editingId ? 'Editar usuario' : 'Crear usuario'}
          description={editingId
            ? 'Actualiza los datos y permisos de este usuario.'
            : 'Completa los datos para agregar una persona al gimnasio.'}
          onClose={handleCloseUsuarioForm}
        >
          {mensaje && <p className="mensaje modal-form-feedback">{mensaje}</p>}
          <form onSubmit={handleSubmit} className="usuario-form">
            <label className="usuario-field" htmlFor="usuario-nombre">
              <span>Nombre</span>
              <input
                id="usuario-nombre"
                type="text"
                placeholder="Nombre completo"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
              {errors.nombre && <span className="error">{errors.nombre}</span>}
            </label>

            <label className="usuario-field" htmlFor="usuario-correo">
              <span>Correo electrónico</span>
              <input
                id="usuario-correo"
                type="email"
                placeholder="nombre@correo.com"
                value={form.correo_electronico}
                onChange={(e) => setForm({ ...form, correo_electronico: e.target.value })}
              />
              {errors.correo_electronico && <span className="error">{errors.correo_electronico}</span>}
            </label>

            <label className="usuario-field" htmlFor="usuario-telefono">
              <span>Teléfono</span>
              <input
                id="usuario-telefono"
                type="text"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
              {errors.telefono && <span className="error">{errors.telefono}</span>}
            </label>

            <label className="usuario-field" htmlFor="usuario-rol">
              <span>Rol</span>
              <select id="usuario-rol" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                <option value="socio">Socio</option>
                <option value="empleado">Empleado</option>
                <option value="admin">Admin</option>
              </select>
              {errors.rol && <span className="error">{errors.rol}</span>}
            </label>

            <label className="usuario-field" htmlFor="usuario-estado">
              <span>Estado</span>
              <select id="usuario-estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              {errors.estado && <span className="error">{errors.estado}</span>}
            </label>

            <label className="usuario-field" htmlFor="usuario-ubicacion">
              <span>Sede</span>
              <select
                id="usuario-ubicacion"
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
            </label>

            {!editingId && (
              <label className="usuario-field" htmlFor="usuario-password">
                <span>Contraseña</span>
                <input
                  id="usuario-password"
                  type="password"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                {errors.password && <span className="error">{errors.password}</span>}
              </label>
            )}

            <div className="usuario-form-actions">
              <button className="btn-crear-editar" type="submit">
                {editingId && <i className="fa-solid fa-floppy-disk form-save-icon" aria-hidden="true"></i>}
                {editingId ? 'Guardar cambios' : 'Crear usuario'}
              </button>
              <button type="button" className="btn-cancel-edit" onClick={handleCloseUsuarioForm}>
                Cancelar
              </button>
            </div>
          </form>
        </AdminFormModal>
      )}

      <section className="usuarios-filtros" aria-label="Buscar y filtrar usuarios">
        <input
          type="search"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar por nombre o correo"
          aria-label="Buscar usuarios por nombre o correo"
        />
        <select
          value={filtroRol}
          onChange={(event) => setFiltroRol(event.target.value)}
          aria-label="Filtrar por rol"
        >
          <option value="">Todos los roles</option>
          <option value="socio">Socio</option>
          <option value="empleado">Empleado</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(event) => setFiltroEstado(event.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <select
          value={filtroUbicacion}
          onChange={(event) => setFiltroUbicacion(event.target.value)}
          aria-label="Filtrar por ubicación"
        >
          <option value="">Todas las ubicaciones</option>
          {ubicaciones.map((ubicacion) => (
            <option key={ubicacion.id} value={ubicacion.id}>
              {ubicacion.nombre} - {ubicacion.ciudad}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="usuarios-filtros-limpiar"
          onClick={() => {
            setBusqueda('');
            setFiltroRol('');
            setFiltroEstado('activo');
            setFiltroUbicacion('');
          }}
        >
          Limpiar filtros
        </button>
        <span className="usuarios-resultados">
          {usuariosFiltrados.length} de {usuarios.length} usuarios
        </span>
      </section>

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
            {usuariosPagina.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nombre}</td>
                <td>{u.correo_electronico}</td>
                <td>{u.telefono}</td>
                <td>{capitalizar(u.rol)}</td>
                <td>{capitalizar(u.eliminado ? 'inactivo' : u.estado)}</td>
                <td>{u.ubicacion_nombre || 'Sin ubicación'}</td>
                <td>
                  {!u.eliminado && (
                    <>
                      <button
                        type="button"
                        className="usuarios-action-button usuarios-action-edit"
                        onClick={() => handleEdit(u)}
                        title={`Editar usuario ${u.nombre}`}
                        aria-label={`Editar usuario ${u.nombre}`}
                      >
                        <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        className="usuarios-action-button usuarios-action-view"
                        onClick={() => handleView(u.id)}
                        title={`Ver perfil de ${u.nombre}`}
                        aria-label={`Ver perfil de ${u.nombre}`}
                      >
                        <i className="fa-solid fa-eye" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        className="usuarios-action-button usuarios-action-disable"
                        onClick={() => handleDeleteClick(u)}
                        title={`Cambiar a inactivo a ${u.nombre}`}
                        aria-label={`Cambiar a inactivo a ${u.nombre}`}
                      >
                        <i className="fa-solid fa-user-slash" aria-hidden="true"></i>
                      </button>
                    </>
                  )}
                  {u.eliminado ? (
                    <button
                      type="button"
                      className="usuarios-action-button usuarios-action-enable"
                      onClick={() => handleActivarUsuario(u.id)}
                      title={`Activar usuario ${u.nombre}`}
                      aria-label={`Activar usuario ${u.nombre}`}
                    >
                      <i className="fa-solid fa-user-check" aria-hidden="true"></i>
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
            {usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan="8" className="usuarios-sin-resultados">
                  No se encontraron usuarios con esos criterios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="usuarios-paginacion">
        <label className="usuarios-tamano-pagina">
          Mostrar
          <select
            value={usuariosPorPagina}
            onChange={(event) => setUsuariosPorPagina(Number(event.target.value))}
            aria-label="Cantidad de usuarios por página"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          por página
        </label>
        <span className="usuarios-rango-pagina">
          {usuariosFiltrados.length === 0
            ? '0 usuarios'
            : `${(paginaActual - 1) * usuariosPorPagina + 1}-${Math.min(paginaActual * usuariosPorPagina, usuariosFiltrados.length)} de ${usuariosFiltrados.length}`}
        </span>
        <div className="usuarios-paginacion-botones">
          <button
            type="button"
            onClick={() => setPaginaActual((pagina) => Math.max(1, pagina - 1))}
            disabled={paginaActual === 1}
          >
            Anterior
          </button>
          <span>Página {paginaActual} de {totalPaginas}</span>
          <button
            type="button"
            onClick={() => setPaginaActual((pagina) => Math.min(totalPaginas, pagina + 1))}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente
          </button>
        </div>
      </div>
      {perfilSeleccionado && (
        <div className="modal-overlay perfil-modal-overlay">
          <section
            className="modal-content perfil-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="perfil-modal-title"
          >
            <header className="perfil-modal-header">
              <div>
                <span className="perfil-eyebrow">
                  {editMode ? 'Edición de usuario' : 'Información del usuario'}
                </span>
                <h2 id="perfil-modal-title">
                  {editMode ? 'Editar perfil' : `Perfil de ${perfilSeleccionado.nombre}`}
                </h2>
                <p>
                  {editMode
                    ? 'Actualiza los datos personales y la foto del usuario.'
                    : 'Consulta los datos y el estado de la cuenta.'}
                </p>
              </div>
              <button
                type="button"
                className="perfil-close-button"
                onClick={cerrarPerfil}
                aria-label="Cerrar perfil"
                title="Cerrar perfil"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </header>
            <div className="perfil-card">
              <div className="perfil-avatar-panel">
                <img
                  src={preview ? preview : perfilSeleccionado.foto ? `${API_LOCAL}${perfilSeleccionado.foto}` : defaultAvatar}
                  alt={`Foto de perfil de ${perfilSeleccionado.nombre}`}
                  className="perfil-avatar"
                />
                {!editMode && (
                  <span
                    className={`perfil-status ${
                      perfilSeleccionado.eliminado || perfilSeleccionado.estado === 'inactivo'
                        ? 'perfil-status-inactive'
                        : 'perfil-status-active'
                    }`}
                  >
                    {capitalizar(
                      perfilSeleccionado.eliminado ? 'inactivo' : perfilSeleccionado.estado || 'activo'
                    )}
                  </span>
                )}
                <span className="perfil-avatar-caption">
                  {preview ? 'Vista previa seleccionada' : editMode ? 'Foto actual del usuario' : 'Foto de perfil'}
                </span>
              </div>

              {!editMode ? (
                <div className="perfil-info">
                  <div className="perfil-detail-grid">
                    <div className="perfil-detail">
                      <span>Correo electrónico</span>
                      <strong>{perfilSeleccionado.correo_electronico || 'Sin correo'}</strong>
                    </div>
                    <div className="perfil-detail">
                      <span>Teléfono</span>
                      <strong>{perfilSeleccionado.telefono || 'Sin teléfono'}</strong>
                    </div>
                    <div className="perfil-detail">
                      <span>Rol</span>
                      <strong>{capitalizar(perfilSeleccionado.rol) || 'Sin rol'}</strong>
                    </div>
                    <div className="perfil-detail perfil-detail-location">
                      <span>Sede</span>
                      <strong>{perfilSeleccionado.ubicacion_nombre || 'Sin ubicación asignada'}</strong>
                    </div>
                  </div>
                  <div className="perfil-actions">
                    <button type="button" onClick={() => setEditMode(true)} className="perfil-button">
                      <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                      Editar perfil
                    </button>
                    <button type="button" onClick={cerrarPerfil} className="cancel-button">
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdatePerfil} className="perfil-info perfil-edit-form">
                  <div className="perfil-fields-grid">
                    <label className="perfil-field" htmlFor="perfil-nombre">
                      <span>Nombre</span>
                      <input
                        id="perfil-nombre"
                        type="text"
                        name="nombre"
                        defaultValue={perfilSeleccionado.nombre}
                      />
                      {errors.nombre && <span className="error">{errors.nombre}</span>}
                    </label>

                    <label className="perfil-field" htmlFor="perfil-correo">
                      <span>Correo electrónico</span>
                      <input
                        id="perfil-correo"
                        type="email"
                        name="correo_electronico"
                        defaultValue={perfilSeleccionado.correo_electronico}
                      />
                      {errors.correo_electronico && <span className="error">{errors.correo_electronico}</span>}
                    </label>

                    <label className="perfil-field" htmlFor="perfil-telefono">
                      <span>Teléfono</span>
                      <input
                        id="perfil-telefono"
                        type="text"
                        name="telefono"
                        defaultValue={perfilSeleccionado.telefono || ''}
                      />
                      {errors.telefono && <span className="error">{errors.telefono}</span>}
                    </label>

                    <label className="perfil-field" htmlFor="perfil-rol">
                      <span>Rol</span>
                      <select id="perfil-rol" name="rol" defaultValue={perfilSeleccionado.rol}>
                        <option value="socio">Socio</option>
                        <option value="empleado">Empleado</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>

                    <label className="perfil-field" htmlFor="perfil-estado">
                      <span>Estado</span>
                      <select id="perfil-estado" name="estado" defaultValue={perfilSeleccionado.estado}>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </label>

                    <div className="perfil-upload-field">
                      <span className="perfil-field-label">Foto de perfil</span>
                      <input
                        type="file"
                        id="foto"
                        name="foto"
                        className="file-input"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="foto" className="file-label">
                        <i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
                        Seleccionar foto
                      </label>
                      <span className="file-name">{fileName}</span>
                    </div>

                    <div className="perfil-ubicacion-field">
                      <SelectorUbicacion
                        selectedUbicacion={perfilSeleccionado.ubicacion_id}
                        setSelectedUbicacion={(id) => setPerfilSeleccionado({ ...perfilSeleccionado, ubicacion_id: id })}
                      />
                      {errors.ubicacion_id && <span className="error">{errors.ubicacion_id}</span>}
                    </div>
                  </div>
                  <div className="perfil-actions">
                    <button type="submit" className="perfil-button">
                      <i className="fa-solid fa-floppy-disk" aria-hidden="true"></i>
                      Guardar cambios
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditMode(false); setPreview(null); setFileName('Ningún archivo seleccionado'); }}
                      className="cancel-button"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
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
