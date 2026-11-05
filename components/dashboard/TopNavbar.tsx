'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import {
  Search,
  Bell,
  Menu,
  Plus,
  BookOpen,
  User,
  ArrowRight,
  AlertTriangle,
  Clock,
  X,
} from 'lucide-react';
import { NewLoanModal } from './NewLoanModal';

interface TopNavbarProps {
  onOpenMobileSidebar: () => void;
}

export function TopNavbar({ onOpenMobileSidebar }: TopNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [alerts, setAlerts] = useState<{ overdue: any[]; dueSoon: any[] }>({ overdue: [], dueSoon: [] });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ books: any[]; members: any[]; loans: any[] }>({
    books: [],
    members: [],
    loans: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const getPageInfo = () => {
    switch (pathname) {
      case '/pages/dashboard':
        return { title: 'Dashboard Overview', breadcrumb: 'Dashboard' };
      case '/pages/dashboard/books':
        return { title: 'Katalog Koleksi Buku', breadcrumb: 'Data Buku' };
      case '/pages/dashboard/categories':
        return { title: 'Kategori Koleksi', breadcrumb: 'Kategori Buku' };
      case '/pages/dashboard/members':
        return { title: 'Data Anggota Perpustakaan', breadcrumb: 'Data Anggota' };
      case '/pages/dashboard/loans':
        return { title: 'Transaksi Peminjaman', breadcrumb: 'Peminjaman Buku' };
      case '/pages/dashboard/returns':
        return { title: 'Pengembalian Buku & Denda', breadcrumb: 'Pengembalian' };
      case '/pages/dashboard/overdue':
        return { title: 'Monitoring Buku Terlambat', breadcrumb: 'Buku Terlambat' };
      case '/pages/dashboard/history':
        return { title: 'Riwayat Transaksi Sirkulasi', breadcrumb: 'Riwayat Transaksi' };
      case '/pages/dashboard/reports':
        return { title: 'Laporan & Statistik Aktivitas', breadcrumb: 'Laporan' };
      case '/pages/dashboard/settings':
        return { title: 'Konfigurasi Sistem Perpustakaan', breadcrumb: 'Pengaturan' };
      default:
        return { title: 'Dashboard', breadcrumb: 'Menu' };
    }
  };

  const { title, breadcrumb } = getPageInfo();

  const loadAlerts = () => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.alerts) {
          setAlerts({
            overdue: res.data.alerts.overdue || [],
            dueSoon: res.data.alerts.dueSoon || [],
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAlerts();
  }, [pathname]);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults({ books: [], members: [], loans: [] });
      setSearchDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [bookRes, memRes, loanRes] = await Promise.all([
          fetch(`/api/books?search=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
          fetch(`/api/members?search=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
          fetch(`/api/loans?search=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        ]);

        setSearchResults({
          books: (bookRes.success ? bookRes.data : []).slice(0, 3),
          members: (memRes.success ? memRes.data : []).slice(0, 3),
          loans: (loanRes.success ? loanRes.data : []).slice(0, 3),
        });
        setSearchDropdownOpen(true);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalAlertsCount = alerts.overdue.length + alerts.dueSoon.length;

  return (
    <>
      <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 px-4 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Buka Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
              <span>Arsip Perpustakaan</span>
              <span>/</span>
              <span className="text-zinc-600 dark:text-zinc-300 truncate">{breadcrumb}</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {title}
            </h1>
          </div>
        </div>

        <div ref={searchRef} className="relative hidden md:block w-72 lg:w-96">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari buku, anggota, atau no. transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.length >= 2) setSearchDropdownOpen(true);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {searchDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 z-50 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-zinc-500">Mencari katalog data...</div>
              ) : searchResults.books.length === 0 &&
                searchResults.members.length === 0 &&
                searchResults.loans.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400">
                  Tidak ada data yang cocok dengan &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.books.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Buku
                      </div>
                      {searchResults.books.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => {
                            setSearchDropdownOpen(false);
                            router.push('/pages/dashboard/books');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                              {b.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono shrink-0 ml-2">
                            {b.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.members.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Anggota
                      </div>
                      {searchResults.members.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSearchDropdownOpen(false);
                            router.push('/pages/dashboard/members');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                              {m.fullName}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono shrink-0 ml-2">
                            {m.memberNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.loans.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Transaksi
                      </div>
                      {searchResults.loans.map((l) => (
                        <div
                          key={l.id}
                          onClick={() => {
                            setSearchDropdownOpen(false);
                            router.push('/pages/dashboard/history');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                              {l.transactionCode} ({l.memberName})
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 shrink-0 ml-2">
                            {l.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLoanModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Peminjaman</span>
          </button>

          <div ref={notifRef} className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 relative transition-colors"
              title="Notifikasi Sirkulasi"
            >
              <Bell className="w-4 h-4" />
              {totalAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {totalAlertsCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Notifikasi Sirkulasi
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      {totalAlertsCount} peringatan memerlukan perhatian
                    </p>
                  </div>
                  <button
                    onClick={() => setIsNotificationOpen(false)}
                    className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2.5">
                  {totalAlertsCount === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-400">
                      Tidak ada buku terlambat atau mendekati jatuh tempo saat ini.
                    </div>
                  ) : (
                    <>
                      {alerts.overdue.map((l) => (
                        <div
                          key={l.id}
                          onClick={() => {
                            setIsNotificationOpen(false);
                            router.push('/pages/dashboard/overdue');
                          }}
                          className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 cursor-pointer hover:shadow-xs transition-all"
                        >
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                                Terlambat: {l.memberName}
                              </div>
                              <p className="text-[11px] text-rose-700 dark:text-rose-400 line-clamp-1 mt-0.5">
                                {l.items.map((i: any) => i.bookTitle).join(', ')}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-rose-600 dark:text-rose-400 font-mono">
                                <span>Batas: {l.dueDate}</span>
                                <span>•</span>
                                <span>Denda: Rp {l.totalFine?.toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {alerts.dueSoon.map((l) => (
                        <div
                          key={l.id}
                          onClick={() => {
                            setIsNotificationOpen(false);
                            router.push('/pages/dashboard/history');
                          }}
                          className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 cursor-pointer hover:shadow-xs transition-all"
                        >
                          <div className="flex items-start gap-2.5">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                                Jatuh Tempo Segera: {l.memberName}
                              </div>
                              <p className="text-[11px] text-amber-700 dark:text-amber-400 line-clamp-1 mt-0.5">
                                {l.items.map((i: any) => i.bookTitle).join(', ')}
                              </p>
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-1 block">
                                Batas Pengembalian: {l.dueDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                {user?.fullName || user?.firstName || 'Petugas'}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">Petugas Perpustakaan</span>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <NewLoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onSuccess={() => {
          loadAlerts();
          router.refresh();
        }}
      />
    </>
  );
}

