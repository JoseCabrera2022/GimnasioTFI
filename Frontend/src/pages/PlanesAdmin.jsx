import { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/PlanesAdmin.css';

function PlanesAdmin() {
  const { token } = useAuthStore();
  const [planes, setPlanes] = useState([]);
  const [duraciones, setDuraciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Formularios
  const [formPlan, setFormPlan] = useState({ nombre: '', tipo: '', precio: '', descripcion: '' });
  const [editPlanId, setEditPlanId] = useState(null);

  const [formDuracion, setFormDuracion] = useState({ nombre: '', dias: '', descuento: '' });
  const [editDuracionId, setEditDuracionId] = useState(null);

  // Mensajes separados
  const [mensajePlanes, setMensajePlanes] = useState('');
  const [mensajeDuraciones, setMensajeDuraciones] = useState('');

  const fetchData = async () => {
    try {
      const res = await axios.get(ENDPOINTS_LOCAL.PLANES, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlanes(res.data.planes);
      setDuraciones(res.data.duraciones);
    } catch (error) {
      setMensajePlanes('Error al cargar planes/duraciones');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const confirmDelete = (tipo, id) => {
  setDeleteTarget({ tipo, id });
  setShowModal(true);
};

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.tipo === 'plan') {
        await axios.delete(`${ENDPOINTS_LOCAL.PLANES}/${deleteTarget.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensajePlanes('Plan eliminado');
      } else {
        await axios.delete(`${ENDPOINTS_LOCAL.DURACIONES}/${deleteTarget.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensajeDuraciones('Duración eliminada');
      }
      fetchData();
    } catch (error) {
      if (deleteTarget.tipo === 'plan') setMensajePlanes('Error al eliminar plan');
      else setMensajeDuraciones('Error al eliminar duración');
    }
    setShowModal(false);
    setDeleteTarget(null);
  };
  // CRUD Planes
  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    if (!formPlan.nombre || !formPlan.tipo || !formPlan.precio) {
      setMensajePlanes('Todos los campos son obligatorios');
      return;
    }
    if (formPlan.precio <= 0) {
      setMensajePlanes('El precio debe ser mayor a 0');
      return;
    }
    try {
      if (editPlanId) {
        await axios.put(`${ENDPOINTS_LOCAL.PLANES}/${editPlanId}`, formPlan, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensajePlanes('Plan actualizado');
      } else {
        await axios.post(ENDPOINTS_LOCAL.PLANES, formPlan, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensajePlanes('Plan creado');
      }
      setFormPlan({ nombre: '', tipo: '', precio: '', descripcion: '' });
      setEditPlanId(null);
      fetchData();
    } catch (error) {
      setMensajePlanes('Error al guardar plan');
    }
  };

  const handleEditPlan = (plan) => {
    setFormPlan({
      nombre: plan.nombre,
      tipo: plan.tipo,
      precio: plan.precio,
      descripcion: plan.descripcion
    });
    setEditPlanId(plan.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePlan = async (id) => {
    try {
      await axios.delete(`${ENDPOINTS_LOCAL.PLANES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensajePlanes('Plan eliminado');
      fetchData();
    } catch (error) {
      setMensajePlanes('Error al eliminar plan');
    }
  };

  // CRUD Duraciones
  const handleSubmitDuracion = async (e) => {
    e.preventDefault();
    if (!formDuracion.nombre || !formDuracion.dias) {
      setMensajeDuraciones('Nombre y días son obligatorios');
      return;
    }
    if (formDuracion.dias <= 0) {
      setMensajeDuraciones('Los días deben ser mayores a 0');
      return;
    }
    if (formDuracion.descuento < 0 || formDuracion.descuento > 1) {
      setMensajeDuraciones('El descuento debe estar entre 0.0 y 1.0');
      return;
    }
    try {
      if (editDuracionId) {
        await axios.put(`${ENDPOINTS_LOCAL.DURACIONES}/${editDuracionId}`, formDuracion, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensajeDuraciones('Duración actualizada');
      } else {
        await axios.post(ENDPOINTS_LOCAL.DURACIONES, formDuracion, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensajeDuraciones('Duración creada');
      }
      setFormDuracion({ nombre: '', dias: '', descuento: '' });
      setEditDuracionId(null);
      fetchData();
    } catch (error) {
      setMensajeDuraciones('Error al guardar duración');
    }
  };

  const handleEditDuracion = (duracion) => {
    setFormDuracion({
      nombre: duracion.nombre,
      dias: duracion.dias,
      descuento: duracion.descuento
    });
    setEditDuracionId(duracion.id);
  };

  const handleDeleteDuracion = async (id) => {
    try {
      await axios.delete(`${ENDPOINTS_LOCAL.DURACIONES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensajeDuraciones('Duración eliminada');
      fetchData();
    } catch (error) {
      setMensajeDuraciones('Error al eliminar duración');
    }
  };

  return (
    <div className="planes-admin">
      <h1>Gestión de Planes y Duraciones</h1>

      {/* Formulario de Planes */}
      <form onSubmit={handleSubmitPlan} className="plan-form">
        <h2>{editPlanId ? 'Editar Plan' : 'Crear Plan'}</h2>
        <input type="text" placeholder="Nombre" value={formPlan.nombre}
          onChange={(e) => setFormPlan({ ...formPlan, nombre: e.target.value })} />
        <input type="text" placeholder="Tipo" value={formPlan.tipo}
          onChange={(e) => setFormPlan({ ...formPlan, tipo: e.target.value })} />
        <input type="number" placeholder="Precio" value={formPlan.precio}
          onChange={(e) => setFormPlan({ ...formPlan, precio: e.target.value })} />
        <textarea placeholder="Descripción" value={formPlan.descripcion}
          onChange={(e) => setFormPlan({ ...formPlan, descripcion: e.target.value })}></textarea>
        <div className="form-actions">
          <button type="submit" className="btn-primary">{editPlanId ? 'Actualizar' : 'Crear'} Plan</button>
          {editPlanId && <button type="button" className="btn-secondary" onClick={() => { setFormPlan({ nombre: '', tipo: '', precio: '', descripcion: '' }); setEditPlanId(null); }}>Cancelar</button>}
        </div>
      </form>

      {/* Mensaje de planes */}
      {mensajePlanes && <p className="alerta">{mensajePlanes}</p>}

      {/* Tabla de Planes */}
      <table className="planes-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {planes.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.tipo}</td>
              <td>{p.precio}</td>
              <td>{p.descripcion}</td>
              <td>
                <button onClick={() => handleEditPlan(p)} className="btn-secondary">Editar</button>
                <button onClick={() => confirmDelete('plan', p.id)} className="btn-danger">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario de Duraciones */}
      <form onSubmit={handleSubmitDuracion} className="duracion-form">
        <h2>{editDuracionId ? 'Editar Duración' : 'Crear Duración'}</h2>
        <input
          type="text"
          placeholder="Nombre"
          value={formDuracion.nombre}
          onChange={(e) => setFormDuracion({ ...formDuracion, nombre: e.target.value })}
        />
        <input
          type="number"
          placeholder="Días"
          value={formDuracion.dias}
          onChange={(e) => setFormDuracion({ ...formDuracion, dias: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Descuento (ej: 0.2 = 20%)"
          value={formDuracion.descuento}
          onChange={(e) => setFormDuracion({ ...formDuracion, descuento: e.target.value })}
        />
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editDuracionId ? 'Actualizar' : 'Crear'} Duración
          </button>
          {editDuracionId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setFormDuracion({ nombre: '', dias: '', descuento: '' });
                setEditDuracionId(null);
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Mensaje de duraciones */}
      {mensajeDuraciones && <p className="alerta">{mensajeDuraciones}</p>}

      {/* Tabla de Duraciones */}
      <table className="duraciones-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Días</th>
            <th>Descuento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {duraciones.map((d) => (
            <tr key={d.id}>
              <td>{d.nombre}</td>
              <td>{d.dias}</td>
              <td>{d.descuento ? `${d.descuento * 100}%` : '0%'}</td>
              <td>
                <button onClick={() => handleEditDuracion(d)} className="btn-secondary">
                  Editar
                </button>
                <button onClick={() => confirmDelete('duracion', d.id)} className="btn-danger">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
      <div className="modal-overlay">
        <div className="modal">
          <h3>¿Seguro que quieres eliminar este {deleteTarget?.tipo}?</h3>
          <div className="modal-actions">
            <button onClick={handleConfirmDelete} className="btn-danger">Sí, eliminar</button>
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default PlanesAdmin;
