'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  RotateCcw,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Loan } from '@/lib/types';

export default function HistoryPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [settling, setSettling] = useState(false);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/loans');
      const json = await res.json();
      if (json.success) setLoans(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleSettleFine = async (loanId: string) => {
    setSettling(true);
    try {
      const res = await fetch(`/api/loans/${loanId}/settle`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setSelectedLoan(json.data);
        loadLoans();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSettling(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Kode Transaksi',
      'Nama Peminjam',
      'No Anggota',
      'Unit/Kelas',
      'Tanggal Pinjam',
      'Jatuh Tempo',
      'Status',
      'Total Buku',
      'Denda (Rp)',
      'Status Denda',
      'Petugas',
    ];

    const rows = filteredLoans.map((l) => [
      l.transactionCode,
      `"${l.memberName}"`,
      l.memberNumber,
      `"${l.memberDepartment || '-'}"`,
      l.loanDate,
      l.dueDate,
      l.status,
      l.items.length,
      l.totalFine || 0,
      l.totalFine > 0 ? (l.finePaid ? 'LUNAS' : 'BELUM LUNAS') : '-',
      `"${l.processedBy}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat-transaksi-perpustakaan-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLoans = loans.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      search === '' ||
      l.transactionCode.toLowerCase().includes(q) ||
      l.memberName.toLowerCase().includes(q) ||
      l.memberNumber.toLowerCase().includes(q) ||
      l.items.some((i) => i.bookTitle.toLowerCase().includes(q) || i.bookCode.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesDateFrom = dateFrom === '' || l.loanDate >= dateFrom;
    const matchesDateTo = dateTo === '' || l.loanDate <= dateTo;

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage) || 1;
  const paginatedLoans = filteredLoans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-600" />
            Riwayat Transaksi Sirkulasi
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Rekam jejak seluruh transaksi peminjaman, pengembalian buku, dan audit audit petugas perpustakaan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={filteredLoans.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={loadLoans}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600"
            title="Segarkan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari transaksi, anggota, buku..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">Semua Status Transaksi</option>
              <option value="ACTIVE">Aktif (Sedang Dipinjam)</option>
              <option value="PARTIAL">Sebagian Dikembalikan</option>
              <option value="RETURNED">Selesai (Semua Kembali)</option>
              <option value="OVERDUE">Terlambat</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              placeholder="Dari Tanggal"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <input
              type="date"
              placeholder="Sampai Tanggal"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span>Menemukan {filteredLoans.length} rekaman transaksi</span>
          {(dateFrom || dateTo || statusFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setDateFrom('');
                setDateTo('');
                setCurrentPage(1);
              }}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-zinc-500">Memuat riwayat transaksi...</p>
          </div>
        ) : paginatedLoans.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <History className="w-10 h-10 text-zinc-300 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Tidak ada data transaksi yang cocok
            </h4>
            <p className="text-xs text-zinc-500">Periksa kembali filter atau rentang tanggal Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">No. Transaksi</th>
                  <th className="py-3 px-4">Peminjam</th>
                  <th className="py-3 px-4">Koleksi Buku</th>
                  <th className="py-3 px-4">Tgl Pinjam</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Denda</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {paginatedLoans.map((l) => (
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
                        {l.items.map((i) => i.bookTitle).join(', ')}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {l.items.length} item buku
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                      {l.loanDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                      {l.dueDate}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      {l.totalFine > 0 ? (
                        <div>
                          <div className="font-bold text-rose-600">
                            Rp {l.totalFine.toLocaleString('id-ID')}
                          </div>
                          <span className={`text-[10px] font-semibold ${l.finePaid ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {l.finePaid ? '✓ Lunas' : 'Belum Lunas'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedLoan(l);
                          setIsDetailOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1 font-semibold text-xs"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
            <span className="text-zinc-500">
              Menampilkan {paginatedLoans.length} dari {filteredLoans.length} transaksi
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isDetailOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  Rincian Transaksi Sirkulasi
                </h3>
                <span className="text-xs font-mono text-zinc-400">
                  {selectedLoan.transactionCode}
                </span>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <div>
                  <span className="text-zinc-400">Peminjam:</span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {selectedLoan.memberName}
                  </p>
                  <p className="text-[11px] text-zinc-400">{selectedLoan.memberNumber}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Status Transaksi:</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedLoan.status} />
                  </div>
                </div>
                <div>
                  <span className="text-zinc-400">Tgl Pinjam & Jatuh Tempo:</span>
                  <p className="text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">
                    {selectedLoan.loanDate} → {selectedLoan.dueDate}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-400">Petugas Pemroses:</span>
                  <p className="text-zinc-800 dark:text-zinc-200 font-semibold mt-0.5">
                    {selectedLoan.processedBy}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Daftar Eksemplar Buku Dipinjam ({selectedLoan.items.length})
                </h5>
                <div className="space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                  {selectedLoan.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-xs"
                    >
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">
                          {it.bookTitle}
                        </span>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          Kode: {it.bookCode} • ISBN: {it.isbn}
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={it.status} size="sm" />
                        {it.returnedAt && (
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            Kembali: {it.returnedAt}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedLoan.totalFine > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Total Denda Keterlambatan: Rp {selectedLoan.totalFine.toLocaleString('id-ID')}
                    </span>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                      Status pembayaran:{' '}
                      <strong>{selectedLoan.finePaid ? 'Lunas' : 'Belum Dibayar'}</strong>
                    </p>
                  </div>

                  {!selectedLoan.finePaid && (
                    <button
                      onClick={() => handleSettleFine(selectedLoan.id)}
                      disabled={settling}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
                    >
                      {settling ? 'Menyimpan...' : 'Lunaskan Denda'}
                    </button>
                  )}
                </div>
              )}

              {selectedLoan.notes && (
                <div>
                  <span className="text-zinc-400">Catatan:</span>
                  <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 italic">
                    {selectedLoan.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

