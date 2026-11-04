'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle, BookOpen, User, Calendar } from 'lucide-react';
import { Book, Member } from '@/lib/types';

interface NewLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewLoanModal({ isOpen, onClose, onSuccess }: NewLoanModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [loanDurationDays, setLoanDurationDays] = useState(7);
  const [maxBooks, setMaxBooks] = useState(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Loan and due dates
  const todayStr = new Date().toISOString().split('T')[0];
  const [loanDate, setLoanDate] = useState(todayStr);

  const calculateDueDate = (startDate: string, days: number) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState(() => calculateDueDate(todayStr, 7));

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setSelectedBookIds([]);
      setSelectedMemberId('');
      setNotes('');
      setLoading(true);

      Promise.all([
        fetch('/api/members?status=ACTIVE').then((r) => r.json()),
        fetch('/api/books?availability=AVAILABLE').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
      ])
        .then(([memRes, bookRes, setRes]) => {
          if (memRes.success) setMembers(memRes.data);
          if (bookRes.success) setBooks(bookRes.data);
          if (setRes.success && setRes.data) {
            const dur = setRes.data.defaultLoanDurationDays || 7;
            setLoanDurationDays(dur);
            setMaxBooks(setRes.data.maxBooksPerMember || 3);
            setDueDate(calculateDueDate(todayStr, dur));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, todayStr]);

  const handleDateChange = (newLoanDate: string) => {
    setLoanDate(newLoanDate);
    setDueDate(calculateDueDate(newLoanDate, loanDurationDays));
  };

  const handleAddBook = (bookId: string) => {
    if (!bookId) return;
    if (selectedBookIds.includes(bookId)) {
      setErrorMessage('Buku sudah dipilih sebelumnya.');
      return;
    }
    if (selectedBookIds.length >= maxBooks) {
      setErrorMessage(`Maksimal ${maxBooks} buku per transaksi peminjaman.`);
      return;
    }
    setErrorMessage('');
    setSelectedBookIds([...selectedBookIds, bookId]);
  };

  const handleRemoveBook = (bookId: string) => {
    setSelectedBookIds(selectedBookIds.filter((id) => id !== bookId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedMemberId) {
      setErrorMessage('Silakan pilih anggota peminjam.');
      return;
    }
    if (selectedBookIds.length === 0) {
      setErrorMessage('Pilih minimal satu buku.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMemberId,
          bookIds: selectedBookIds,
          loanDate,
          dueDate,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan transaksi peminjaman.');
      }

      setSuccessMessage(`Peminjaman berhasil dicatat dengan kode transaksi ${data.data.transactionCode}!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Catat Peminjaman Buku Baru
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Pilih anggota dan judul buku yang dipinjam
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-zinc-500">Memuat data koleksi dan anggota...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 1. Pilih Anggota */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                1. Identitas Anggota Peminjam *
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              >
                <option value="">-- Cari atau Pilih Anggota Aktif --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.memberNumber}) — {m.department}
                  </option>
                ))}
              </select>

              {selectedMember && (
                <div className="mt-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{selectedMember.fullName}</span>
                    <span className="text-zinc-400">({selectedMember.department})</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    Status: Aktif
                  </span>
                </div>
              )}
            </div>

            {/* 2. Pilih Buku */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  2. Pilih Buku Koleksi (Maks. {maxBooks}) *
                </label>
                <span className="text-xs text-zinc-400">
                  {selectedBookIds.length} dari {maxBooks} dipilih
                </span>
              </div>

              <select
                onChange={(e) => {
                  handleAddBook(e.target.value);
                  e.target.value = '';
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                disabled={selectedBookIds.length >= maxBooks}
              >
                <option value="">+ Tambah Buku ke Keranjang Peminjaman...</option>
                {books
                  .filter((b) => !selectedBookIds.includes(b.id))
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.code}] {b.title} (Sisa Stok: {b.availableCopies})
                    </option>
                  ))}
              </select>

              {/* Selected books list */}
              <div className="mt-3 space-y-2">
                {selectedBookIds.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-xs text-zinc-400">
                    Belum ada buku yang dipilih.
                  </div>
                ) : (
                  selectedBookIds.map((bId) => {
                    const book = books.find((b) => b.id === bId);
                    if (!book) return null;
                    return (
                      <div
                        key={book.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-zinc-500" />
                          <div>
                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                              {book.title}
                            </div>
                            <div className="text-xs text-zinc-400 flex items-center gap-2">
                              <span>Kode: {book.code}</span>
                              <span>•</span>
                              <span>Rak: {book.shelfLocation}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveBook(book.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          title="Hapus buku"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. Waktu Peminjaman & Jatuh Tempo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Tanggal Pinjam *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={loanDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Tanggal Jatuh Tempo ({loanDurationDays} Hari) *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 4. Catatan Tambahan */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Catatan Transaksi (Opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Keperluan tugas akhir, peminjaman kelompok..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || selectedBookIds.length === 0 || !selectedMemberId}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/60 dark:border-zinc-900/60 border-t-white dark:border-t-zinc-900 rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  'Simpan Transaksi'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

