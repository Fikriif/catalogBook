'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  History,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Library,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function AppSidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [overdueCount, setOverdueCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setOverdueCount(data.data.overdueLoansCount || 0);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    {
      group: 'Utama',
      items: [
        { label: 'Dashboard', href: '/pages/dashboard', icon: LayoutDashboard },
        { label: 'Data Buku', href: '/pages/dashboard/books', icon: BookOpen },
        { label: 'Kategori Buku', href: '/pages/dashboard/categories', icon: Tag },
        { label: 'Data Anggota', href: '/pages/dashboard/members', icon: Users },
      ],
    },
    {
      group: 'Sirkulasi',
      items: [
        { label: 'Peminjaman Buku', href: '/pages/dashboard/loans', icon: ArrowUpRight },
        { label: 'Pengembalian Buku', href: '/pages/dashboard/returns', icon: ArrowDownLeft },
        {
          label: 'Buku Terlambat',
          href: '/pages/dashboard/overdue',
          icon: AlertTriangle,
          badge: overdueCount > 0 ? overdueCount : undefined,
          badgeVariant: 'danger',
        },
        { label: 'Riwayat Transaksi', href: '/pages/dashboard/history', icon: History },
      ],
    },
    {
      group: 'Lainnya',
      items: [
        { label: 'Laporan', href: '/pages/dashboard/reports', icon: FileSpreadsheet },
        { label: 'Pengaturan', href: '/pages/dashboard/settings', icon: Settings },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300">
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200/80 dark:border-zinc-800">
        <Link href="/pages/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shrink-0 shadow-xs">
            <Library className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                Libra <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">Arsip</span>
              </span>
              <span className="text-[11px] text-zinc-400 truncate">Sistem Perpustakaan</span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase mb-2">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'}`} />
                  {!collapsed && <span className="truncate flex-1">{item.label}</span>}

                  {!collapsed && item.badge !== undefined && (
                    <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {collapsed && item.badge !== undefined && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800">
        {!collapsed ? (
          <div className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Status Operasional</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">Semua modul siap digunakan</p>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="Sistem Aktif">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className={`fixed top-0 bottom-0 left-0 transition-all duration-300 z-30 ${collapsed ? 'w-20' : 'w-64'}`}>
          {sidebarContent}
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 w-72 z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}

