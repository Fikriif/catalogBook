'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Search,
  RotateCcw,
  Clock,
  ArrowRight,
  DollarSign,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Loan, LibrarySettings } from '@/lib/types';

export default function OverduePage() {
  const router = useRouter();
  const [overdueLoans, setOverdueLoans] = useState<Loan[]>([]);
  const [settings, setSettings] = useState<LibrarySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [delayFilter, setDelayFilter] = useState<'ALL' | 'SHORT' | 'MEDIUM' | 'LONG'>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const [loanRes, setRes] = await Promise.all([
        fetch('/api/loans?status=OVERDUE').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
      ]);

      if (loanRes.success) setOverdueLoans(loanRes.data);
      if (setRes.success) setSettings(setRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const getDaysLate = (dueDate: string) => {
    const due = new Date(dueDate).getTime();
    const now = new Date(todayStr).getTime();
    return Math.max(0, Math.ceil((now - due) / (1000 * 60 * 60 * 24)));
  };

  const filtered = overdueLoans
    .filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        l.transactionCode.toLowerCase().includes(q) ||
        l.memberName.toLowerCase().includes(q) ||
        l.memberNumber.toLowerCase().includes(q) ||
        l.items.some((i) => i.bookTitle.toLowerCase().includes(q) || i.bookCode.toLowerCase().includes(q));

      const days = getDaysLate(l.dueDate);
      let matchesDelay = true;
      if (delayFilter === 'SHORT') matchesDelay = days <= 3;
      else if (delayFilter === 'MEDIUM') matchesDelay = days >= 4 && days <= 7;
      else if (delayFilter === 'LONG') matchesDelay = days > 7;

      return matchesSearch && matchesDelay;
    })
    .sort((a, b) => getDaysLate(b.dueDate) - getDaysLate(a.dueDate));

  const totalOverdueItems = filtered.reduce(
    (sum, l) => sum + l.items.filter((i) => i.status !== 'RETURNED').length,
    0
  );
  const totalEstimatedFines = filtered.reduce((sum, l) => sum + (l.totalFine || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            Monitoring Buku Terlambat
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Daftar seluruh transaksi peminjaman yang telah melewati batas tenggat pengembalian.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-semibold transition-all shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Segarkan Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5">
          <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
            Total Transaksi Terlambat
          </span>
          <div className="text-2xl font-bold text-rose-950 dark:text-rose-100 mt-2">
            {filtered.length} Transaksi
          </div>
          <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-1">
            Membutuhkan tindak lanjut petugas
          </p>
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            Jumlah Eksemplar Tertahan
          </span>
          <div className="text-2xl font-bold text-amber-950 dark:text-amber-100 mt-2">
            {totalOverdueItems} Buku
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
            Belum kembali ke rak perpustakaan
          </p>
        </div>

        <div className="bg-zinc-900 text-white dark:bg-zinc-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Estimasi Akumulasi Denda
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            Rp {totalEstimatedFines.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Tarif: Rp {settings?.fineRatePerDay.toLocaleString('id-ID')}/hari/buku
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari kode transaksi, nama, judul buku..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select
            value={delayFilter}
            onChange={(e) => setDelayFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">Semua Rentang Waktu</option>
            <option value="SHORT">Terlambat 1 - 3 Hari</option>
            <option value="MEDIUM">Terlambat 4 - 7 Hari</option>
            <option value="LONG">Terlambat &gt; 7 Hari</option>
          </select>
        </div>

        <span className="text-xs text-zinc-500 font-medium">
          Diurutkan dari keterlambatan terlama
        </span>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-zinc-500">Memeriksa keterlambatan pengembalian...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Tidak ada buku yang terlambat
            </h4>
            <p className="text-xs text-zinc-500">
              Semua peminjaman buku saat ini masih dalam batas tanggal jatuh tempo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">No. Transaksi</th>
                  <th className="py-3 px-4">Peminjam</th>
                  <th className="py-3 px-4">Buku Terlambat</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4 text-center">Lama Terlambat</th>
                  <th className="py-3 px-4 text-right">Estimasi Denda</th>
                  <th className="py-3 px-4 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((l) => {
                  const days = getDaysLate(l.dueDate);
                  const unreturned = l.items.filter((i) => i.status !== 'RETURNED');

                  return (
                    <tr key={l.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {l.transactionCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {l.memberName}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {l.memberNumber} • {l.memberDepartment}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200 line-clamp-1">
                          {unreturned.map((i) => i.bookTitle).join(', ')}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {unreturned.length} judul belum dikembalikan
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                        {l.dueDate}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          {days} Hari
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        Rp {l.totalFine?.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href="/pages/dashboard/returns"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold shadow-xs"
                        >
                          <span>Proses Kembali</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

