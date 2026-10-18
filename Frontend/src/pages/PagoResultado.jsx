import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { generarPDF } from '../utils/pdfGenerator';
import { QRCodeCanvas } from 'qrcode.react';
import { traducirEstado, traducirMetodo } from '../utils/conversiones';

import '../styles/PagoResultado.css';

function PagoResultado() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const paymentId = query.get('payment_id');
  const estadoQuery = query.get('status');

  // 🔹 fallback: deducir estado por pathname si no viene en query
  const estado = estadoQuery ||
    (location.pathname.includes('fallido') ? 'rejected'
    : location.pathname.includes('exitoso') ? 'approved'
    : 'pending');

  const [detallePago, setDetallePago] = useState(null);
  const [error, setError] = useState(null);

  // 🔹 traer detalle del pago si hay paymentId
  useEffect(() => {
    if (!paymentId) return;
    const fetchPago = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/pagos/verificar?payment_id=${paymentId}`);
        setDetallePago(res.data);
      } catch (err) {
        console.error('Error al verificar pago:', err);
        setError('No se pudo verificar el pago. Intenta más tarde.');
      }
    };
    fetchPago();
  }, [paymentId]);

  // 🔹 Si no hay paymentId, mostrar mensaje genérico
  if (!paymentId) {
    return (
      <div className="comprobante-visual">
        <img src="/assets/fuerzavitalgym.png" alt="Logo Fuerza Vital Gym" className="logo" />
        <h3>COMPROBANTE DE PAGO</h3>
        <p>
          <strong>Estado:</strong>
          <span className={`estado-badge ${estado}`}>{traducirEstado(estado)}</span>
        </p>
        {estado === 'rejected' && <p>❌ El pago fue cancelado o rechazado.</p>}
        {estado === 'pending' && <p>⏳ El pago está pendiente de acreditación.</p>}
        <button className={`btn-volver ${estado}`} onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  // 🔹 Si hay error en la petición
  if (error) {
    return (
      <div className="comprobante-visual">
        <h3>COMPROBANTE DE PAGO</h3>
        <p style={{ color: 'red' }}>{error}</p>
        <button className="btn-volver rejected" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  // 🔹 Si todavía no llegó detallePago
  if (!detallePago) {
    return (
      <div className="comprobante-visual">
        <h3>COMPROBANTE DE PAGO</h3>
        <p>Cargando detalle del pago...</p>
      </div>
    );
  }

  // 🔹 Si hay paymentId y detallePago, mostrar comprobante completo
  return (
    <>
      <div className="botones-superior">
        <button className="btn-descargar" onClick={() => generarPDF(detallePago, paymentId)}>
          Descargar PDF
        </button>
        <button className={`btn-volver ${estado}`} onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
      <div className="comprobante-visual">
        <img src="/assets/fuerzavitalgym.png" alt="Logo Fuerza Vital Gym" className="logo" />
        <h3>COMPROBANTE DE PAGO</h3>

        <div className="datos">
          <p>
            <strong>Estado:</strong>
            <span className={`estado-badge ${estado}`}>{traducirEstado(estado)}</span>
          </p>
          <p><strong>ID de pago:</strong> {paymentId}</p>
          <p><strong>Monto:</strong> ${detallePago.monto}</p>
          <p><strong>Método:</strong> {traducirMetodo(detallePago.metodo)}</p>
          <p><strong>Email:</strong> {detallePago.email}</p>
          <p><strong>Fecha:</strong> {new Date(detallePago.fecha).toLocaleString()}</p>
          <p><strong>Plan:</strong> {detallePago.metadata?.nombre}</p>
          <p><strong>Duración:</strong> {detallePago.metadata?.duracion}</p>
        </div>

        <h4>Beneficios incluidos:</h4>
        <ul className="beneficios">
          {detallePago.metadata?.beneficios
            ? detallePago.metadata.beneficios.split(',').map((b, i) => <li key={i}>{b.trim()}</li>)
            : <li>No se especificaron beneficios</li>}
        </ul>

        <div className="qr">
          <QRCodeCanvas
            value={`https://fuerzavitalgym.com/validar-pago/${paymentId}`}
            size={128}
          />
        </div>

        <p className="footer">
          Gracias por entrenar con nosotros<br />
          <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer">
            fuerzavitalgym.com
          </a>
        </p>
      </div>
    </>
  );
}

export default PagoResultado;
