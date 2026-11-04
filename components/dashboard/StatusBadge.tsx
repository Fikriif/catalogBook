import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const s = status.toUpperCase();
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  switch (s) {
    case 'ACTIVE':
    case 'AKTIF':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Aktif
        </span>
      );
    case 'AVAILABLE':
    case 'TERSEDIA':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Tersedia
        </span>
      );
    case 'BORROWED':
    case 'DIPINJAM':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          Dipinjam
        </span>
      );
    case 'OVERDUE':
    case 'TERLAMBAT':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Terlambat
        </span>
      );
    case 'PARTIAL':
    case 'SEBAGIAN':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Sebagian Kembali
        </span>
      );
    case 'RETURNED':
    case 'SELESAI':
    case 'DIKEMBALIKAN':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
          Selesai
        </span>
      );
    case 'INACTIVE':
    case 'NONAKTIF':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
          Nonaktif
        </span>
      );
    case 'PAID':
    case 'LUNAS':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5`}>
          ✓ Lunas
        </span>
      );
    case 'UNPAID':
    case 'BELUM LUNAS':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs px-2 py-0.5`}>
          ! Belum Lunas
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}

