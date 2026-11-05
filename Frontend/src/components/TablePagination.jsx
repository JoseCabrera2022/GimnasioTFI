import '../styles/TablePagination.css';

export default function TablePagination({
  page,
  setPage,
  pageSize,
  setPageSize,
  totalItems,
  totalPages,
}) {
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <nav className="table-pagination" aria-label="Paginación de tabla">
      <label className="table-pagination-size">
        Mostrar
        <select
          value={pageSize}
          onChange={(event) => setPageSize(event.target.value)}
          aria-label="Cantidad de elementos por página"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
        por página
      </label>
      <span className="table-pagination-range">
        {totalItems === 0 ? '0 elementos' : `${firstItem}-${lastItem} de ${totalItems}`}
      </span>
      <div className="table-pagination-controls">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          type="button"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={page === totalPages}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
