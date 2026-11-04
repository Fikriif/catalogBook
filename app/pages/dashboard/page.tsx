'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookCopy,
  BookMarked,
  Users,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { DashboardStats } from '@/lib/types';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchStats = async (timeRange: string = range, isChartOnly = false) => {
    if (isChartOnly) setChartLoading(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/dashboard/stats?range=${timeRange}`);
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchStats('7d');
  }, []);

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    fetchStats(newRange, true);
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-28 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
      </div>
    );
  }

  const {
    totalCopies = 0,
    uniqueTitles = 0,
    totalMembers = 0,
    activeMembers = 0,
    currentlyBorrowed = 0,
    overdueLoansCount = 0,
    availableCopies = 0,
    recentActivities = [],
    popularBooks = [],
    alerts = { overdue: [], dueSoon: [], lowStock: [] },
    trendData = { labels: [], loans: [], returns: [] },
  } = stats || {};

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 text-zinc-300 text-xs font-medium border border-zinc-700/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sistem Manajemen Peminjaman Buku Perpustakaan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ringkasan Operasional Perpustakaan
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Pantau sirkulasi peminjaman, pengembalian koleksi, dan tindakan keterlambatan secara akurat dan terintegrasi.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => fetchStats(range)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
              title="Sinkronisasi Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Segarkan Data</span>
            </button>
            <Link
              href="/pages/dashboard/loans"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Catat Peminjaman</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Ambient subtle background effect */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 6 Key Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Buku"
          value={totalCopies}
          subtitle="Seluruh eksemplar"
          icon={BookCopy}
          badge={{ text: 'Koleksi', variant: 'neutral' }}
          accentColor="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
        />

        <StatCard
          title="Judul Buku"
          value={uniqueTitles}
          subtitle="Judul unik"
          icon={BookMarked}
          badge={{ text: 'Katalog', variant: 'neutral' }}
          accentColor="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
        />

        <StatCard
          title="Total Anggota"
          value={totalMembers}
          subtitle={`${activeMembers} anggota aktif`}
          icon={Users}
          badge={{ text: 'Anggota', variant: 'positive' }}
          accentColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
        />

        <StatCard
          title="Sedang Dipinjam"
          value={currentlyBorrowed}
          subtitle="Eksemplar di luar"
          icon={ArrowUpRight}
          badge={{ text: 'Sirkulasi', variant: 'info' }}
          accentColor="bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
        />

        <StatCard
          title="Terlambat"
          value={overdueLoansCount}
          subtitle={overdueLoansCount > 0 ? 'Perlu tindakan' : 'Semua tertib'}
          icon={AlertTriangle}
          badge={{ text: overdueLoansCount > 0 ? 'Waspada' : 'Aman', variant: overdueLoansCount > 0 ? 'negative' : 'positive' }}
          accentColor={overdueLoansCount > 0 ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" : "bg-emerald-50 text-emerald-600"}
        />

        <StatCard
          title="Tersedia"
          value={availableCopies}
          subtitle="Siap dipinjam"
          icon={CheckCircle2}
          badge={{ text: 'Di Rak', variant: 'positive' }}
          accentColor="bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400"
        />
      </div>

      {/* Circulation Trends Graph & Alerts Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (2 columns on lg) */}
        <div className="lg:col-span-2">
          <TrendChart
            data={trendData}
            range={range}
            onRangeChange={handleRangeChange}
            isLoading={chartLoading}
          />
        </div>

        {/* Section: Peringatan dan Perhatian */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Perhatian Khusus
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {alerts.overdue.length + alerts.dueSoon.length + alerts.lowStock.length} Item
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {/* Overdue */}
              {alerts.overdue.map((l) => (
                <Link
                  key={l.id}
                  href="/pages/dashboard/overdue"
                  className="block p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 hover:border-rose-400 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                      Buku Terlambat
                    </span>
                    <span className="text-[10px] font-mono text-rose-600">
                      {l.dueDate}
                    </span>
                  </div>
                  <p className="text-xs text-rose-950 dark:text-rose-200 mt-1 font-medium line-clamp-1">
                    {l.memberName}
                  </p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 line-clamp-1 mt-0.5">
                    {l.items.map((i: any) => i.bookTitle).join(', ')}
                  </p>
                </Link>
              ))}

              {/* Due soon */}
              {alerts.dueSoon.map((l) => (
                <Link
                  key={l.id}
                  href="/pages/dashboard/history"
                  className="block p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 hover:border-amber-400 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      Jatuh Tempo Segera
                    </span>
                    <span className="text-[10px] font-mono text-amber-600">
                      {l.dueDate}
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 dark:text-amber-200 mt-1 font-medium line-clamp-1">
                    {l.memberName}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 line-clamp-1 mt-0.5">
                    {l.items.map((i: any) => i.bookTitle).join(', ')}
                  </p>
                </Link>
              ))}

              {/* Low stock */}
              {alerts.lowStock.map((b) => (
                <Link
                  key={b.id}
                  href="/pages/dashboard/books"
                  className="block p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Stok Menipis
                    </span>
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                      Sisa {b.availableCopies} buku
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 font-medium line-clamp-1">
                    {b.title}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Lokasi: {b.shelfLocation}
                  </p>
                </Link>
              ))}

              {alerts.overdue.length === 0 && alerts.dueSoon.length === 0 && alerts.lowStock.length === 0 && (
                <div className="py-8 text-center text-xs text-zinc-400">
                  Semua transaksi dan stok buku dalam kondisi aman.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-4 text-center">
            <Link
              href="/pages/dashboard/overdue"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Buka Pusat Keterlambatan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Aktivitas Terbaru & Buku Populer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aktivitas Terbaru (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Aktivitas Sirkulasi Terbaru
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                5 transaksi peminjaman dan pengembalian terakhir
              </p>
            </div>
            <Link
              href="/pages/dashboard/history"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <span>Lihat Seluruh Riwayat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="pb-3 pl-1">No. Transaksi</th>
                  <th className="pb-3">Peminjam</th>
                  <th className="pb-3">Buku Dipinjam</th>
                  <th className="pb-3">Tgl Pinjam</th>
                  <th className="pb-3">Batas Kembali</th>
                  <th className="pb-3 text-right pr-1">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentActivities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400">
                      Belum ada transaksi aktivitas perpustakaan.
                    </td>
                  </tr>
                ) : (
                  recentActivities.map((loan) => (
                    <tr key={loan.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 pl-1 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                        {loan.transactionCode}
                      </td>
                      <td className="py-3.5">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {loan.memberName}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {loan.memberDepartment || loan.memberNumber}
                        </div>
                      </td>
                      <td className="py-3.5 max-w-xs">
                        <div className="text-zinc-700 dark:text-zinc-300 font-medium line-clamp-1">
                          {loan.items.map((it) => it.bookTitle).join(', ')}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {loan.items.length} item buku
                        </div>
                      </td>
                      <td className="py-3.5 text-zinc-600 dark:text-zinc-400">
                        {loan.loanDate}
                      </td>
                      <td className="py-3.5 text-zinc-600 dark:text-zinc-400 font-mono">
                        {loan.dueDate}
                      </td>
                      <td className="py-3.5 text-right pr-1">
                        <StatusBadge status={loan.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Buku Populer (1 col) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Buku Paling Populer
                </h3>
              </div>
              <span className="text-xs text-zinc-400">Frekuensi</span>
            </div>

            <div className="space-y-4">
              {popularBooks.map((item, idx) => (
                <div key={item.bookId} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {item.title}
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                        {item.loanCount}x
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                      <span className="truncate">{item.author}</span>
                      <span className="shrink-0 font-medium text-emerald-600 dark:text-emerald-400">
                        Sisa: {item.availableCopies}/{item.totalCopies}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(100, (item.loanCount / 5) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4 text-center">
            <Link
              href="/pages/dashboard/books"
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 inline-flex items-center gap-1"
            >
              <span>Jelajahi Semua Koleksi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
