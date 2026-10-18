import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import defaultAvatar from '../assets/default-avatar.png';
import http from '../utils/axiosConfig';
import axios from 'axios';
import { API_LOCAL, ENDPOINTS_LOCAL } from '../api/endpoints';
import '../styles/Perfil.css';
import SessionBanner from '../components/SessionBanner';
import SelectorUbicacion from '../components/SelectorUbicacion';

function Perfil() {
  const { usuario, token, logout, updateUsuario, login, sessionExpired } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [fileName, setFileName] = useState('Ningún archivo seleccionado');
  const [preview, setPreview] = useState(null);
  const [ubicacionId, setUbicacionId] = useState(usuario?.ubicacion_id ?? '');
  const [ubicaciones, setUbicaciones] = useState([]);
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!token || sessionExpired) return;
      try {
        const res = await http.get(ENDPOINTS_LOCAL.PERFIL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        updateUsuario(res.data.usuario || res.data); // soporta ambos formatos
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

  if (!usuario || sessionExpired) {
    return <SessionBanner />;
  }

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
      const res = await http.put(ENDPOINTS_LOCAL.PERFIL, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔹 Backend devuelve { usuario, token }
      updateUsuario(res.data.usuario);
      login(res.data.usuario, res.data.token);

      setEditMode(false);
      setPreview(null);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    }
  };

  const sedeActual = ubicaciones.find((u) => u.id === (usuario?.ubicacion_id ?? ubicacionId));

  return (
    <div className="perfil-container">
      <h2>Mi Perfil</h2>
      <div className="perfil-card">
        <img
          src={preview ? preview : usuario?.foto ? `${API_LOCAL}${usuario.foto}` : defaultAvatar}
          alt="avatar"
          className="perfil-avatar"
        />

        {!editMode ? (
          <div className="perfil-info">
            <p><strong>Nombre:</strong> {usuario.nombre}</p>
            <p><strong>Correo:</strong> {usuario.correo_electronico}</p>
            {usuario.telefono && <p><strong>Teléfono:</strong> {usuario.telefono}</p>}
            {usuario.rol && <p><strong>Rol:</strong> {usuario.rol}</p>}
            {sedeActual && (
              <p><strong>Sede:</strong> {sedeActual.nombre} - {sedeActual.ciudad}</p>
            )}
            <button onClick={() => setEditMode(true)} className="perfil-button">
              Editar
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="perfil-info">
            <input type="text" name="nombre" defaultValue={usuario.nombre} />
            {errors.nombre && <span className="error">{errors.nombre}</span>}

            <input type="email" name="correo_electronico" defaultValue={usuario.correo_electronico} />
            {errors.correo_electronico && <span className="error">{errors.correo_electronico}</span>}

            <input type="text" name="telefono" defaultValue={usuario.telefono || ''} />
            {errors.telefono && <span className="error">{errors.telefono}</span>}

            <input type="file" id="foto" name="foto" className="file-input" onChange={handleFileChange} />

            <SelectorUbicacion
              selectedUbicacion={ubicacionId}
              setSelectedUbicacion={setUbicacionId}
            />
            {errors.ubicacion_id && <span className="error">{errors.ubicacion_id}</span>}

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

      <button onClick={logout} className="logout-button">Cerrar sesión</button>
    </div>
  );
}

export default Perfil;
