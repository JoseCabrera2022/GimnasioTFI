import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routers/routes';
import defaultAvatar from '../assets/default-avatar.png';
import http from '../utils/axiosConfig';
import axios from 'axios';
import { API_LOCAL, ENDPOINTS_LOCAL } from '../api/endpoints';
import '../styles/Perfil.css';
import SelectorUbicacion from '../components/SelectorUbicacion';

function Perfil() {
  const { usuario, token, logout, updateUsuario, login, sessionExpired } = useAuthStore();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [fileName, setFileName] = useState('Ningún archivo seleccionado');
  const [preview, setPreview] = useState(null);
  const [ubicacionId, setUbicacionId] = useState(usuario?.ubicacion_id ?? '');
  const [ubicaciones, setUbicaciones] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

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

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!token || sessionExpired) return;
      try {
        const res = await http.get(ENDPOINTS_LOCAL.PERFIL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        updateUsuario(res.data.usuario || res.data, token); // soporta ambos formatos
        setUbicacionId(res.data.usuario?.ubicacion_id ?? res.data.ubicacion_id ?? '');
      } catch (error) {
        console.error('Error al obtener perfil:', error);
      }
    };

    const fetchUbicaciones = async () => {
      try {
        const res = await axios.get(ENDPOINTS_LOCAL.UBICACIONES);
        setUbicaciones(res.data);
      } catch (error) {
        console.error('Error al obtener ubicaciones:', error);
      }
    };

    fetchPerfil();
    fetchUbicaciones();
  }, [token, updateUsuario, sessionExpired]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const validateForm = (formData) => {
    const newErrors = {};
    if (!formData.get('nombre').trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.get('correo_electronico')))
      newErrors.correo_electronico = 'Correo inválido';
    if (formData.get('telefono') && !/^\d{7,15}$/.test(formData.get('telefono')))
      newErrors.telefono = 'Teléfono inválido';
    if (!ubicacionId) newErrors.ubicacion_id = 'Debes seleccionar una sede';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('ubicacion_id', ubicacionId);

    if (!validateForm(formData)) return;

    try {
      setServerError('');
      const res = await http.put(ENDPOINTS_LOCAL.PERFIL, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      login(res.data.usuario, res.data.token);

      setEditMode(false);
      setPreview(null);
      setFileName('Ningún archivo seleccionado');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setServerError(error.response?.data?.error || 'No se pudo actualizar el perfil. Inténtalo nuevamente.');
    }
  };

  const sedeActual = ubicaciones.find(
    (ubicacion) => Number(ubicacion.id) === Number(usuario?.ubicacion_id ?? ubicacionId)
  );
  const cancelarEdicion = () => {
    setEditMode(false);
    setErrors({});
    setServerError('');
    setFileName('Ningún archivo seleccionado');
    setPreview(null);
    setUbicacionId(usuario?.ubicacion_id ?? '');
  };

  return (
    <section className="perfil-page">
      <header className="perfil-page-header">
        <div>
          <span className="perfil-eyebrow">{editMode ? 'Edición de perfil' : 'Mi cuenta'}</span>
          <h1>{editMode ? 'Editar perfil' : 'Mi perfil'}</h1>
          <p>
            {editMode
              ? 'Actualiza tus datos personales, foto y sede.'
              : 'Consulta y administra tus datos personales.'}
          </p>
        </div>
      </header>

      <div className="perfil-card">
        <aside className="perfil-avatar-panel">
          <img
            src={preview || (usuario?.foto ? `${API_LOCAL}${usuario.foto}` : defaultAvatar)}
            alt={`Foto de perfil de ${usuario.nombre}`}
            className="perfil-avatar"
          />
          <strong className="perfil-name">{usuario.nombre}</strong>
          <span className="perfil-avatar-caption">
            {preview ? 'Vista previa seleccionada' : editMode ? 'Foto actual del perfil' : 'Foto de perfil'}
          </span>
        </aside>

        {!editMode ? (
          <div className="perfil-info">
            <div className="perfil-detail-grid">
              <div className="perfil-detail">
                <span>Nombre</span>
                <strong>{usuario.nombre || 'Sin nombre'}</strong>
              </div>
              <div className="perfil-detail">
                <span>Correo electrónico</span>
                <strong>{usuario.correo_electronico || 'Sin correo'}</strong>
              </div>
              <div className="perfil-detail">
                <span>Teléfono</span>
                <strong>{usuario.telefono || 'Sin teléfono'}</strong>
              </div>
              <div className="perfil-detail">
                <span>Tipo de cuenta</span>
                <strong>{usuario.rol === 'socio' ? 'Socio' : usuario.rol || 'Sin rol'}</strong>
              </div>
              <div className="perfil-detail perfil-detail-location">
                <span>Sede</span>
                <strong>
                  {sedeActual
                    ? `${sedeActual.nombre} - ${sedeActual.ciudad}`
                    : 'Sin sede asignada'}
                </strong>
              </div>
            </div>
            <div className="perfil-actions">
              <button
                type="button"
                onClick={() => {
                  setUbicacionId(usuario.ubicacion_id ?? '');
                  setEditMode(true);
                }}
                className="perfil-button"
              >
                <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                Editar perfil
              </button>
              <button type="button" onClick={handleLogout} className="perfil-logout-button">
                <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="perfil-info perfil-edit-form">
            <div className="perfil-fields-grid">
              <label className="perfil-field" htmlFor="perfil-nombre">
                <span>Nombre</span>
                <input id="perfil-nombre" type="text" name="nombre" defaultValue={usuario.nombre} />
                {errors.nombre && <span className="perfil-error">{errors.nombre}</span>}
              </label>

              <label className="perfil-field" htmlFor="perfil-correo">
                <span>Correo electrónico</span>
                <input
                  id="perfil-correo"
                  type="email"
                  name="correo_electronico"
                  defaultValue={usuario.correo_electronico}
                />
                {errors.correo_electronico && (
                  <span className="perfil-error">{errors.correo_electronico}</span>
                )}
              </label>

              <label className="perfil-field" htmlFor="perfil-telefono">
                <span>Teléfono</span>
                <input
                  id="perfil-telefono"
                  type="text"
                  name="telefono"
                  defaultValue={usuario.telefono || ''}
                />
                {errors.telefono && <span className="perfil-error">{errors.telefono}</span>}
              </label>

              <div className="perfil-upload-field">
                <span className="perfil-field-label">Foto de perfil</span>
                <input
                  type="file"
                  id="perfil-foto"
                  name="foto"
                  className="file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="perfil-foto" className="file-label">
                  <i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
                  Seleccionar foto
                </label>
                <span className="file-name">{fileName}</span>
              </div>

              <div className="perfil-ubicacion-field">
                {usuario.rol === 'empleado' ? (
                  <>
                    <span className="perfil-field-label">Sede asignada</span>
                    <strong>{sedeActual ? `${sedeActual.nombre} - ${sedeActual.ciudad}` : 'Sin sede asignada'}</strong>
                    <input type="hidden" name="ubicacion_id" value={ubicacionId || ''} />
                  </>
                ) : (
                  <SelectorUbicacion
                    selectedUbicacion={ubicacionId}
                    setSelectedUbicacion={setUbicacionId}
                  />
                )}
                {errors.ubicacion_id && <span className="perfil-error">{errors.ubicacion_id}</span>}
              </div>
            </div>

            {serverError && <p className="perfil-server-error" role="alert">{serverError}</p>}

            <div className="perfil-actions">
              <button type="submit" className="perfil-button">
                <i className="fa-solid fa-floppy-disk" aria-hidden="true"></i>
                Guardar cambios
              </button>
              <button type="button" onClick={cancelarEdicion} className="cancel-button">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default Perfil;
