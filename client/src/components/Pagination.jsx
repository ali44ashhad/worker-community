import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

const buildPages = (totalPages, currentPage) => {
  if (totalPages <= 7) return range(1, totalPages);

  const pages = [];
  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  pages.push(1);
  if (left > 2) pages.push('…');
  pages.push(...range(left, right));
  if (right < totalPages - 1) pages.push('…');
  pages.push(totalPages);

  return pages;
};

const PageButton = ({ active, disabled, children, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`min-w-[2.5rem] h-10 px-3 rounded-xl text-sm font-semibold transition-all border ${
      disabled
        ? 'opacity-50 cursor-not-allowed border-purple-100 bg-white text-[var(--text-secondary)]'
        : active
          ? 'border-transparent bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white shadow-sm'
          : 'border-purple-100 bg-white text-[var(--text-secondary)] hover:bg-purple-50 hover:border-purple-200'
    }`}
  >
    {children}
  </button>
);

const Pagination = ({ totalItems, itemsPerPage = 12, currentPage = 1, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / itemsPerPage));

  const pages = useMemo(() => buildPages(totalPages, currentPage), [totalPages, currentPage]);

  if ((totalItems || 0) <= itemsPerPage) return null;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <PageButton disabled={!canPrev} onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}>
          <span className="inline-flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Prev
          </span>
        </PageButton>

        {pages.map((p, idx) =>
          p === '…' ? (
            <span
              key={`ellipsis-${idx}`}
              className="h-10 px-2 inline-flex items-center text-sm font-semibold text-[var(--text-secondary)]"
            >
              …
            </span>
          ) : (
            <PageButton
              key={p}
              active={p === currentPage}
              onClick={() => onPageChange?.(p)}
            >
              {p}
            </PageButton>
          )
        )}

        <PageButton disabled={!canNext} onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}>
          <span className="inline-flex items-center gap-1">
            Next
            <ChevronRight className="w-4 h-4" />
          </span>
        </PageButton>
      </div>

      <p className="text-xs text-[var(--text-secondary)]">
        Page <span className="font-semibold text-[var(--text-primary)]">{currentPage}</span> of{' '}
        <span className="font-semibold text-[var(--text-primary)]">{totalPages}</span>
      </p>
    </div>
  );
};

export default Pagination;

