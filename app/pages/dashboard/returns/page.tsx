'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Calendar,
  DollarSign,
  User,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Loan, LoanItem, LibrarySettings } from '@/lib/types';

export default function ReturnsPage() {
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [settings, setSettings] = useState<LibrarySettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Return Processing Form State
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const todayStr = new Date().toISOString().split('T')[0];
  const [returnDate, setReturnDate] = useState(todayStr);
  const [finePaid, setFinePaid] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loanRes, setRes] = await Promise.all([
        fetch('/api/loans').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
      ]);

      if (loanRes.success) {
        // filter only loans that have unreturned items
        const pending = (loanRes.data as Loan[]).filter(
          (l) => l.status === 'ACTIVE' || l.status === 'PARTIAL' || l.status === 'OVERDUE'
        );
        setActiveLoans(pending);
      }
      if (setRes.success) {
        setSettings(setRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setFeedback(null);
    setFinePaid(false);
    setReturnNotes('');
    setReturnDate(todayStr);

    // Default: select all currently borrowed items in this loan
    const unreturnedItemIds = loan.items.filter((i) => i.status !== 'RETURNED').map((i) => i.id);
    setSelectedItemIds(unreturnedItemIds);
  };

  const toggleItemSelection = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      setSelectedItemIds(selectedItemIds.filter((id) => id !== itemId));
    } else {
      setSelectedItemIds([...selectedItemIds, itemId]);
    }
  };

  // Calculate overdue and fine dynamically based on returnDate
  const calculateLateInfo = () => {
    if (!selectedLoan) return { isLate: false, daysLate: 0, totalFineEst: 0 };

    const isLate = returnDate > selectedLoan.dueDate;
    if (!isLate) return { isLate: false, daysLate: 0, totalFineEst: 0 };

    const due = new Date(selectedLoan.dueDate).getTime();
    const ret = new Date(returnDate).getTime();
    const daysLate = Math.max(0, Math.ceil((ret - due) / (1000 * 60 * 60 * 24)));

    const fineRate = settings?.fineRatePerDay || 1000;
    const isFineEnabled = settings?.isFineEnabled !== false;
    const countItems = selectedItemIds.length;
    const totalFineEst = isFineEnabled ? daysLate * fineRate * countItems : 0;

    return { isLate, daysLate, totalFineEst };
  };

  const { isLate, daysLate, totalFineEst } = calculateLateInfo();

  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || selectedItemIds.length === 0 || submitting) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/loans/${selectedLoan.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemIdsToReturn: selectedItemIds,
          returnDate,
          finePaid: totalFineEst > 0 ? finePaid : true,
          notes: returnNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memproses pengembalian buku');
      }

      setFeedback({
        type: 'success',
        message: `Pengembalian buku berhasil dicatat! Status transaksi kini: ${json.data.status}. Stok buku telah dikembalikan ke rak.`,
      });

      // Reload list and update selected loan
      loadData();
      if (json.data.status === 'RETURNED') {
        setSelectedLoan(null);
      } else {
        setSelectedLoan(json.data);
        const remainingUnreturned = json.data.items.filter((i: LoanItem) => i.status !== 'RETURNED').map((i: LoanItem) => i.id);
        setSelectedItemIds(remainingUnreturned);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLoans = activeLoans.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      searchQuery === '' ||
      l.transactionCode.toLowerCase().includes(q) ||
      l.memberName.toLowerCase().includes(q) ||
      l.memberNumber.toLowerCase().includes(q) ||
      l.items.some((i) => i.bookTitle.toLowerCase().includes(q) || i.bookCode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
            Pengembalian Buku & Pelunasan Denda
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Pencatatan pengembalian buku (penuh atau sebagian), kalkulasi keterlambatan, dan status kas denda.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cari & Pilih Transaksi Peminjaman (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Pilih Transaksi Peminjaman
            </h3>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari kode transaksi, nama, no. anggota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* List of active loans */}
            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <span className="text-xs text-zinc-400 mt-2 block">Memuat transaksi...</span>
                </div>
              ) : filteredLoans.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  Tidak ada peminjaman aktif yang menunggu pengembalian.
                </div>
              ) : (
                filteredLoans.map((loan) => {
                  const isSelected = selectedLoan?.id === loan.id;
                  const isOverdue = loan.status === 'OVERDUE';
                  const unreturnedCount = loan.items.filter((i) => i.status !== 'RETURNED').length;

                  return (
                    <div
                      key={loan.id}
                      onClick={() => handleSelectLoan(loan)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs ring-2 ring-blue-500/20'
                          : isOverdue
                          ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 hover:border-rose-300'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {loan.transactionCode}
                        </span>
                        <StatusBadge status={loan.status} size="sm" />
                      </div>

                      <div className="mt-2">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {loan.memberName}
                        </span>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {loan.items.map((i) => i.bookTitle).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-400 font-mono">
                        <span>Pinjam: {loan.loanDate}</span>
                        <span className={`font-semibold ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                          Batas: {loan.dueDate}
                        </span>
                        <span className="font-medium text-blue-600">
                          {unreturnedCount} buku tersisa
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detail & Eksekusi Pengembalian (7 Cols) */}
        <div className="lg:col-span-7">
          {!selectedLoan ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Pilih Transaksi Peminjaman
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm">
                Pilih salah satu transaksi peminjaman di kolom kiri untuk melihat daftar buku yang dipinjam, memeriksa keterlambatan, dan memproses pengembalian.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleProcessReturn}
              className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Transaction Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedLoan.transactionCode}
                    </span>
                    <StatusBadge status={selectedLoan.status} />
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Peminjam: <strong>{selectedLoan.memberName}</strong> ({selectedLoan.memberNumber})
                  </p>
                </div>

                <div className="text-right text-xs">
                  <div className="text-zinc-400">Jatuh Tempo:</div>
                  <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {selectedLoan.dueDate}
                  </div>
                </div>
              </div>

              {feedback && (
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{feedback.type === 'success' ? 'Berhasil' : 'Gagal'}</div>
                    <p className="mt-0.5 leading-relaxed">{feedback.message}</p>
                  </div>
                </div>
              )}

              {/* Book Items to Return (Multi-select / Partial return) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Pilih Buku yang Dikembalikan Saat Ini
                  </label>
                  <span className="text-xs text-zinc-400">
                    Mendukung pengembalian sebagian
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedLoan.items.map((item) => {
                    const isAlreadyReturned = item.status === 'RETURNED';
                    const isChecked = selectedItemIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (!isAlreadyReturned) toggleItemSelection(item.id);
                        }}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                          isAlreadyReturned
                            ? 'bg-zinc-100/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 opacity-60 cursor-not-allowed'
                            : isChecked
                            ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 cursor-pointer'
                            : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 cursor-pointer hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isAlreadyReturned}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {item.bookTitle}
                            </span>
                            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                              Kode: {item.bookCode} • ISBN: {item.isbn}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isAlreadyReturned ? (
                            <span className="text-[11px] font-semibold text-zinc-500">
                              Sudah Kembali ({item.returnedAt})
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-blue-600">
                              {isChecked ? 'Akan Dikembalikan' : 'Ditahan'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tanggal Pengembalian Aktual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Tanggal Pengembalian Aktual *
                  </label>
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Status Keterlambatan
                  </label>
                  <div className="px-4 py-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-between">
                    <span>
                      {isLate ? (
                        <span className="text-rose-600 font-bold">Terlambat {daysLate} Hari</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">Tepat Waktu</span>
                      )}
                    </span>
                    <span className="text-zinc-400 font-mono">Batas: {selectedLoan.dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Denda Keterlambatan Info Card */}
              {isLate && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                        Kalkulasi Denda Keterlambatan
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-amber-800 dark:text-amber-200 font-mono">
                      Rp {totalFineEst.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Dihitung dari: {daysLate} hari × Rp {settings?.fineRatePerDay.toLocaleString('id-ID')} × {selectedItemIds.length} buku.
                  </p>

                  <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/80 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={finePaid}
                        onChange={(e) => setFinePaid(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Tandai Denda Telah Dilunasi Tunai / Kasir</span>
                    </label>

                    <StatusBadge status={finePaid ? 'LUNAS' : 'BELUM LUNAS'} size="sm" />
                  </div>
                </div>
              )}

              {/* Catatan Pengembalian */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Catatan Pengembalian / Kondisi Buku
                </label>
                <textarea
                  rows={2}
                  placeholder="Kondisi buku baik, denda dibayar tunai..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLoan(null)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedItemIds.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 text-xs sm:text-sm font-bold shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {submitting ? 'Memproses Pengembalian...' : 'Proses Pengembalian Buku'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

