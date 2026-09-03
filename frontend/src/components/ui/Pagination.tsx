'use client';

import { PaginationMeta } from '@/types';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function usePageParam(meta: PaginationMeta | undefined, page: number) {
  if (!meta) return {};
  return {
    totalPages: meta.totalPages,
    currentPage: page,
  };
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const totalPages = meta.totalPages;
  if (totalPages <= 1) return null;

  const current = meta.page;
  const pages: number[] = [];
  const start = Math.max(2, current - 2);
  const end = Math.min(totalPages - 1, current + 2);

  pages.push(1);
  for (let p = start; p <= end; p++) {
    if (p > 1 && p < totalPages) pages.push(p);
  }
  if (totalPages > 1) pages.push(totalPages);

  const buttonClass =
    'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <nav className="mt-6 flex items-center justify-center gap-1">
      <button
        className={`${buttonClass} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
      >
        ‹
      </button>
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        return (
          <span key={p} className="flex items-center gap-1">
            {prev && p - prev > 1 && <span className="px-1 text-gray-400">…</span>}
            <button
              className={`${buttonClass} border ${
                p === current
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button
        className={`${buttonClass} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
        disabled={current >= totalPages}
        onClick={() => onPageChange(current + 1)}
      >
        ›
      </button>
    </nav>
  );
}