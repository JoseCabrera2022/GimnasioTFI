import { useEffect, useId } from 'react';
import '../styles/AdminFormModal.css';

function AdminFormModal({ title, description, onClose, children }) {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="admin-form-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="admin-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="admin-form-modal-header">
          <div>
            <span className="admin-form-modal-eyebrow">Administración</span>
            <h2 id={titleId}>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button
            type="button"
            className="admin-form-modal-close"
            onClick={onClose}
            title="Cerrar ventana"
            aria-label="Cerrar ventana"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </header>
        <div className="admin-form-modal-content">{children}</div>
      </section>
    </div>
  );
}

export default AdminFormModal;
