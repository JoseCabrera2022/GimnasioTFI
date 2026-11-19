import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/PlanesAdmin.css';
import AdminFormModal from '../components/AdminFormModal';

function PlanesAdmin() {
  const { token } = useAuthStore();
  const [planes, setPlanes] = useState([]);
  const [duraciones, setDuraciones] = useState([]);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Formularios
  const [formPlan, setFormPlan] = useState({ nombre: '', tipo: '', precio: '', descripcion: '' });
  const [editPlanId, setEditPlanId] = useState(null);
  const [planFormOpen, setPlanFormOpen] = useState(false);

  const [formDuracion, setFormDuracion] = useState({ nombre: '', dias: '', descuento: '' });
  const [editDuracionId, setEditDuracionId] = useState(null);
  const [duracionFormOpen, setDuracionFormOpen] = useState(false);

  // Mensajes separados
  const [mensajePlanes, setMensajePlanes] = useState('');
  const [mensajeDuraciones, setMensajeDuraciones] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const url = `${ENDPOINTS_LOCAL.PLANES}${mostrarInactivos ? '?soloInactivos=true' : ''}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlanes(res.data.planes);
      setDuraciones(res.data.duraciones);
    } catch (error) {
      setMensajePlanes(error.response?.data?.error || 'Error al cargar planes/duraciones');
    }
  }, [token, mostrarInactivos]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetPlanForm = () => {
    setFormPlan({ nombre: '', tipo: '', precio: '', descripcion: '' });
  };

  const handleCreatePlan = () => {
    resetPlanForm();
    setEditPlanId(null);
    setMensajePlanes('');
    setPlanFormOpen(true);
  };

  const handleClosePlanForm = () => {
    resetPlanForm();
    setEditPlanId(null);
    setPlanFormOpen(false);
  };

  const resetDuracionForm = () => {
    setFormDuracion({ nombre: '', dias: '', descuento: '' });
  };

  const handleCreateDuracion = () => {
    resetDuracionForm();
    setEditDuracionId(null);
    setMensajeDuraciones('');
    setDuracionFormOpen(true);
  };

  const handleCloseDuracionForm = () => {
    resetDuracionForm();
    setEditDuracionId(null);
    setDuracionFormOpen(false);
  };

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
        setMensajePlanes('Plan cambiado a inactivo; puedes consultarlo en la lista de inactivos');
      } else {
        await axios.delete(`${ENDPOINTS_LOCAL.DURACIONES}/${deleteTarget.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensajeDuraciones('Duración eliminada');
      }
      fetchData();
    } catch {
      if (deleteTarget.tipo === 'plan') setMensajePlanes('Error al eliminar plan');
      else setMensajeDuraciones('Error al eliminar duración');
    }
    setShowModal(false);
    setDeleteTarget(null);
  };

  const handleActivarPlan = async (id) => {
    try {
      await axios.patch(`${ENDPOINTS_LOCAL.PLANES}/${id}/activar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensajePlanes('Plan activado');
      fetchData();
    } catch (error) {
      setMensajePlanes(error.response?.data?.error || 'Error al activar plan');
    }
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
      resetPlanForm();
      setEditPlanId(null);
      setPlanFormOpen(false);
      fetchData();
    } catch {
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
    setMensajePlanes('');
    setPlanFormOpen(true);
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
      resetDuracionForm();
      setEditDuracionId(null);
      setDuracionFormOpen(false);
      fetchData();
    } catch {
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
    setMensajeDuraciones('');
    setDuracionFormOpen(true);
  };


  return (
    <div className="planes-admin">
      <header className="planes-admin-header">
        <h1>Gestión de Planes y Duraciones</h1>
        <button type="button" className="plan-open-form-button" onClick={handleCreatePlan}>
          <i className="fa-solid fa-circle-plus" aria-hidden="true"></i>
          Crear plan
        </button>
      </header>

      {mensajePlanes && !planFormOpen && <p className="alerta">{mensajePlanes}</p>}

      {planFormOpen && (
        <AdminFormModal
          title={editPlanId ? 'Editar plan' : 'Crear plan'}
          description={editPlanId
            ? 'Actualiza los datos y el precio de este plan.'
            : 'Completa los datos para agregar una nueva opción de membresía.'}
          onClose={handleClosePlanForm}
        >
          {mensajePlanes && <p className="alerta modal-form-feedback">{mensajePlanes}</p>}
          <form onSubmit={handleSubmitPlan} className="plan-form">
            <label className="plan-field">
              <span>Nombre</span>
              <input type="text" placeholder="Nombre del plan" value={formPlan.nombre}
                onChange={(e) => setFormPlan({ ...formPlan, nombre: e.target.value })} />
            </label>
            <label className="plan-field">
              <span>Tipo</span>
              <input type="text" placeholder="Tipo de plan" value={formPlan.tipo}
                onChange={(e) => setFormPlan({ ...formPlan, tipo: e.target.value })} />
            </label>
            <label className="plan-field">
              <span>Precio</span>
              <input type="number" placeholder="Precio" value={formPlan.precio}
                onChange={(e) => setFormPlan({ ...formPlan, precio: e.target.value })} />
            </label>
            <label className="plan-field plan-description-field">
              <span>Descripción</span>
              <textarea placeholder="Descripción del plan" value={formPlan.descripcion}
                onChange={(e) => setFormPlan({ ...formPlan, descripcion: e.target.value })}></textarea>
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editPlanId && <i className="fa-solid fa-floppy-disk form-save-icon" aria-hidden="true"></i>}
                {editPlanId ? 'Guardar cambios' : 'Crear plan'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleClosePlanForm}>
                Cancelar
              </button>
            </div>
          </form>
        </AdminFormModal>
      )}

      {/* Tabla de Planes */}
      <label className="planes-inactive-toggle">
        <input
          type="checkbox"
          checked={mostrarInactivos}
          onChange={(event) => setMostrarInactivos(event.target.checked)}
        />
        Mostrar planes inactivos
      </label>
      <div className="planes-table-container">
        <table className="planes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Descripción</th>
              <th>Estado</th>
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
                <td>{p.eliminado ? 'Inactivo' : 'Activo'}</td>
                <td>
                  {!p.eliminado && (
                    <>
                      <button
                        type="button"
                        className="plan-action-button plan-action-edit"
                        onClick={() => handleEditPlan(p)}
                        title={`Editar plan ${p.nombre}`}
                        aria-label={`Editar plan ${p.nombre}`}
                      >
                        <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        className="plan-action-button plan-action-disable"
                        onClick={() => confirmDelete('plan', p.id)}
                        title={`Cambiar a inactivo el plan ${p.nombre}`}
                        aria-label={`Cambiar a inactivo el plan ${p.nombre}`}
                      >
                        <i className="fa-solid fa-ban" aria-hidden="true"></i>
                      </button>
                    </>
                  )}
                  {p.eliminado ? (
                    <button
                      type="button"
                      className="plan-action-button plan-action-enable"
                      onClick={() => handleActivarPlan(p.id)}
                      title={`Activar plan ${p.nombre}`}
                      aria-label={`Activar plan ${p.nombre}`}
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
      <header className="duraciones-admin-header">
        <div>
          <h2>Duraciones de planes</h2>
          <p>Configura los plazos disponibles y sus descuentos.</p>
        </div>
        <button type="button" className="plan-open-form-button" onClick={handleCreateDuracion}>
          <i className="fa-solid fa-circle-plus" aria-hidden="true"></i>
          Crear duración
        </button>
      </header>

      {mensajeDuraciones && !duracionFormOpen && <p className="alerta">{mensajeDuraciones}</p>}

      {duracionFormOpen && (
        <AdminFormModal
          title={editDuracionId ? 'Editar duración' : 'Crear duración'}
          description={editDuracionId
            ? 'Actualiza el plazo y el descuento de esta duración.'
            : 'Define el plazo en días y el descuento aplicable al plan.'}
          onClose={handleCloseDuracionForm}
        >
          {mensajeDuraciones && <p className="alerta modal-form-feedback">{mensajeDuraciones}</p>}
          <form onSubmit={handleSubmitDuracion} className="duracion-form">
            <label className="plan-field">
              <span>Nombre</span>
              <input
                type="text"
                placeholder="Ej. Trimestral"
                value={formDuracion.nombre}
                onChange={(e) => setFormDuracion({ ...formDuracion, nombre: e.target.value })}
              />
            </label>
            <label className="plan-field">
              <span>Días</span>
              <input
                type="number"
                placeholder="Cantidad de días"
                value={formDuracion.dias}
                onChange={(e) => setFormDuracion({ ...formDuracion, dias: e.target.value })}
              />
            </label>
            <label className="plan-field">
              <span>Descuento (0 a 1)</span>
              <input
                type="number"
                step="0.01"
                placeholder="Ej. 0.2 = 20%"
                value={formDuracion.descuento}
                onChange={(e) => setFormDuracion({ ...formDuracion, descuento: e.target.value })}
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editDuracionId && <i className="fa-solid fa-floppy-disk form-save-icon" aria-hidden="true"></i>}
                {editDuracionId ? 'Guardar cambios' : 'Crear duración'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCloseDuracionForm}>
                Cancelar
              </button>
            </div>
          </form>
        </AdminFormModal>
      )}

      {/* Tabla de Duraciones */}
      <div className="duraciones-table-container">
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
                  <button
                    type="button"
                    className="plan-action-button plan-action-edit"
                    onClick={() => handleEditDuracion(d)}
                    title={`Editar duración ${d.nombre}`}
                    aria-label={`Editar duración ${d.nombre}`}
                  >
                    <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    className="plan-action-button plan-action-delete"
                    onClick={() => confirmDelete('duracion', d.id)}
                    title={`Eliminar duración ${d.nombre}`}
                    aria-label={`Eliminar duración ${d.nombre}`}
                  >
                    <i className="fa-solid fa-trash" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
      <div className="modal-overlay">
        <div className="modal">
          <h3>
            {deleteTarget?.tipo === 'plan'
              ? '¿Seguro que quieres cambiar este plan a inactivo? Quedará oculto de la lista activa.'
              : '¿Seguro que quieres eliminar esta duración?'}
          </h3>
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
