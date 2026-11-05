import { useEffect, useState } from 'react';

export default function useTablePagination(items, resetKey) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [resetKey, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const startIndex = (page - 1) * pageSize;

  return {
    pageItems: items.slice(startIndex, startIndex + pageSize),
    page,
    setPage,
    pageSize,
    setPageSize: (size) => setPageSize(Number(size)),
    totalItems: items.length,
    totalPages,
  };
}
