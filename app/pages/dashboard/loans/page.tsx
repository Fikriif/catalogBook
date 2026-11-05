'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Plus,
  Search,
  BookOpen,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Book, Member, Loan, LibrarySettings } from '@/lib/types';

export default function LoansPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [books, setBooks] = useState<(Book & { categoryName: string })[]>([]);
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
  const [settings, setSettings] = useState<LibrarySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const todayStr = new Date().toISOString().split('T')[0];
  const [loanDate, setLoanDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; transactionCode?: string } | null>(null);

  const calculateDueDate = (start: string, duration: number) => {
    const d = new Date(start);
    d.setDate(d.getDate() + duration);
    return d.toISOString().split('T')[0];
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [memRes, bookRes, loanRes, setRes] = await Promise.all([
        fetch('/api/members?status=ACTIVE').then((r) => r.json()),
        fetch('/api/books').then((r) => r.json()),
        fetch('/api/loans?status=ACTIVE').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
      ]);

      if (memRes.success) setMembers(memRes.data);
      if (bookRes.success) setBooks(bookRes.data);
      if (loanRes.success) setRecentLoans(loanRes.data);
      if (setRes.success && setRes.data) {
        setSettings(setRes.data);
        const dur = setRes.data.defaultLoanDurationDays || 7;
        setDueDate(calculateDueDate(todayStr, dur));
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

  const handleDateChange = (newDate: string) => {
    setLoanDate(newDate);
    const dur = settings?.defaultLoanDurationDays || 7;
    setDueDate(calculateDueDate(newDate, dur));
  };

  const handleAddBook = (bookId: string) => {
    if (!bookId) return;
    const max = settings?.maxBooksPerMember || 3;
    if (selectedBookIds.includes(bookId)) {
      setFeedback({ type: 'error', message: 'Buku sudah ada di daftar peminjaman.' });
      return;
    }
    if (selectedBookIds.length >= max) {
      setFeedback({ type: 'error', message: `Batas maksimal adalah ${max} buku per transaksi.` });
      return;
    }

    setFeedback(null);
    setSelectedBookIds([...selectedBookIds, bookId]);
  };

  const handleRemoveBook = (bookId: string) => {
    setSelectedBookIds(selectedBookIds.filter((id) => id !== bookId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setFeedback(null);

    if (!selectedMemberId) {
      setFeedback({ type: 'error', message: 'Pilih anggota peminjam terlebih dahulu.' });
      return;
    }
    if (selectedBookIds.length === 0) {
      setFeedback({ type: 'error', message: 'Pilih minimal satu judul buku.' });
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

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan transaksi peminjaman.');
      }

      setFeedback({
        type: 'success',
        message: 'Transaksi peminjaman berhasil dicatat dan stok buku telah diperbarui secara konsisten!',
        transactionCode: json.data.transactionCode,
      });

      setSelectedMemberId('');
      setSelectedBookIds([]);
      setNotes('');
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const maxBooks = settings?.maxBooksPerMember || 3;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <ArrowUpRight className="w-6 h-6 text-blue-600" />
            Transaksi Peminjaman Buku
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Alur pencatatan peminjaman baru dengan validasi stok instan dan batas kuota anggota.
          </p>
        </div>

        <Link
          href="/pages/dashboard/returns"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-semibold transition-all shrink-0"
        >
          <span>Ke Menu Pengembalian</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Formulir Peminjaman Koleksi
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Isi data anggota dan buku yang akan dipinjam
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Durasi Standar: {settings?.defaultLoanDurationDays || 7} Hari
              </span>
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
                  <div className="font-bold text-sm">
                    {feedback.type === 'success' ? 'Peminjaman Berhasil!' : 'Validasi Gagal'}
                  </div>
                  <p className="mt-1 leading-relaxed">{feedback.message}</p>
                  {feedback.transactionCode && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-800 rounded-lg border border-emerald-200 font-mono font-bold text-xs">
                      Kode: {feedback.transactionCode}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                1. Pilih Anggota Peminjam *
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              >
                <option value="">-- Pilih Anggota Aktif Terdaftar --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.memberNumber}) — {m.department}
                  </option>
                ))}
              </select>

              {selectedMember && (
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                      {selectedMember.fullName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {selectedMember.fullName}
                      </span>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {selectedMember.memberNumber} • {selectedMember.department}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    Aktif
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  2. Pilih Buku Koleksi (Maksimal {maxBooks} Buku) *
                </label>
                <span className="text-xs text-zinc-400">
                  {selectedBookIds.length} / {maxBooks} buku terpilih
                </span>
              </div>

              <select
                onChange={(e) => {
                  handleAddBook(e.target.value);
                  e.target.value = '';
                }}
                disabled={selectedBookIds.length >= maxBooks}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">+ Tambah Judul Buku ke Transaksi...</option>
                {books
                  .filter((b) => !selectedBookIds.includes(b.id) && b.availableCopies > 0)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.code}] {b.title} — Rak: {b.shelfLocation} (Sisa Stok: {b.availableCopies})
                    </option>
                  ))}
              </select>

              <div className="space-y-2.5 mt-3">
                {selectedBookIds.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-xs text-zinc-400">
                    Belum ada buku yang dimasukkan ke keranjang transaksi peminjaman ini.
                  </div>
                ) : (
                  selectedBookIds.map((bId) => {
                    const book = books.find((b) => b.id === bId);
                    if (!book) return null;
                    return (
                      <div
                        key={book.id}
                        className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {book.title}
                            </h5>
                            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                              Kode: {book.code} • Rak: {book.shelfLocation} • Penulis: {book.author}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveBook(book.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 shrink-0 ml-3"
                          title="Hapus dari transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Tanggal Peminjaman *
                </label>
                <input
                  type="date"
                  required
                  value={loanDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Batas Pengembalian (Jatuh Tempo) *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Catatan Petugas (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Catatan keperluan atau kondisi buku khusus..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting || selectedBookIds.length === 0 || !selectedMemberId}
                className="px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-xs sm:text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/60 dark:border-zinc-900/60 border-t-white dark:border-t-zinc-900 rounded-full animate-spin"></div>
                    Memvalidasi & Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi & Simpan Peminjaman</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Aturan Peminjaman
              </h4>
            </div>

            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5"></span>
                <span>Maksimal <strong>{maxBooks} buku</strong> dipinjam bersamaan oleh satu anggota.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5"></span>
                <span>Stok buku akan berkurang otomatis dan diverifikasi secara atomik.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5"></span>
                <span>Tarif denda keterlambatan berjalan: <strong>Rp {settings?.fineRatePerDay.toLocaleString('id-ID')}/hari/buku</strong>.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Peminjaman Aktif Terkini
              </h4>
              <span className="text-[11px] font-semibold text-zinc-400">
                {recentLoans.length} aktif
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentLoans.length === 0 ? (
                <p className="text-xs text-zinc-400 py-6 text-center">
                  Belum ada peminjaman aktif.
                </p>
              ) : (
                recentLoans.slice(0, 5).map((l) => (
                  <div
                    key={l.id}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {l.transactionCode}
                      </span>
                      <StatusBadge status={l.status} size="sm" />
                    </div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                      {l.memberName}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {l.items.map((i) => i.bookTitle).join(', ')}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-[10px] text-zinc-400 font-mono">
                      <span>Pinjam: {l.loanDate}</span>
                      <span className="font-bold text-blue-600">Batas: {l.dueDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

