function ComparacionModal({ planes, onClose }) {
  // 🔹 Definir jerarquía (puede venir de BD)
  const jerarquia = {
    basico: null,
    estandar: 'basico',
    premium: 'estandar'
  };

  // 🔹 Expandir beneficios
  const expandirBeneficios = (plan) => {
    let beneficios = plan.descripcion?.split(',').map(b => b.trim()) || [];
    // quitar strings genéricos
    beneficios = beneficios.filter(b => !b.toLowerCase().includes('incluye beneficios del básico') && !b.toLowerCase().includes('todo lo anterior'));

    // si hereda de otro plan, agregar beneficios del padre
    const padreTipo = jerarquia[plan.tipo];
    if (padreTipo) {
      const padre = planes.find(p => p.tipo === padreTipo);
      if (padre) {
        beneficios = [...new Set([...beneficios, ...expandirBeneficios(padre)])];
      }
    }
    return beneficios;
  };

  const beneficiosPorPlan = planes.map(p => ({
    id: p.id,
    nombre: p.nombre,
    beneficios: expandirBeneficios(p)
  }));

  const beneficiosUnicos = [...new Set(beneficiosPorPlan.flatMap(p => p.beneficios))];

  const tieneBeneficio = (planId, beneficio) => {
    const plan = beneficiosPorPlan.find(p => p.id === planId);
    return plan?.beneficios.includes(beneficio);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-comparacion" onClick={(e) => e.stopPropagation()}>
        <h2>Comparación de beneficios</h2>
        <table>
          <thead>
            <tr>
              <th>Beneficio</th>
              {beneficiosPorPlan.map((plan) => (
                <th key={plan.id}>{plan.nombre}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {beneficiosUnicos.map((beneficio) => (
              <tr key={beneficio}>
                <td>{beneficio}</td>
                {beneficiosPorPlan.map((plan) => (
                  <td key={`${plan.id}-${beneficio}`}>
                    {tieneBeneficio(plan.id, beneficio) ? '✅' : '❌'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn-cerrar" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
export default ComparacionModal;
