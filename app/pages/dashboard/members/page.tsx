'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  UserX,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Member, Loan } from '@/lib/types';

export default function MembersPage() {
  const [members, setMembers] = useState<(Member & { activeLoansCount: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedMember, setSelectedMember] = useState<(Member & { activeLoansCount: number; loans?: Loan[] }) | null>(null);

  const [formData, setFormData] = useState({
    memberNumber: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/members');
      const json = await res.json();
      if (json.success) {
        setMembers(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const openCreateModal = () => {
    setFormMode('create');
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData({
      memberNumber: `LIB-2026-${randomNum}`,
      fullName: '',
      email: '',
      phone: '',
      department: 'RPL - Kelas XII-B',
      status: 'ACTIVE',
      notes: '',
    });
    setFeedback(null);
    setIsFormOpen(true);
  };

  const openEditModal = (m: Member & { activeLoansCount: number }) => {
    setFormMode('edit');
    setSelectedMember(m);
    setFormData({
      memberNumber: m.memberNumber,
      fullName: m.fullName,
      email: m.email || '',
      phone: m.phone || '',
      department: m.department || '',
      status: m.status,
      notes: m.notes || '',
    });
    setFeedback(null);
    setIsFormOpen(true);
  };

  const openDetailModal = async (m: Member & { activeLoansCount: number }) => {
    try {
      const res = await fetch(`/api/members/${m.id}`);
      const json = await res.json();
      if (json.success) {
        setSelectedMember(json.data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const url = formMode === 'create' ? '/api/members' : `/api/members/${selectedMember?.id}`;
      const method = formMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan data anggota');
      }

      setFeedback({
        type: 'success',
        message: formMode === 'create' ? 'Anggota baru berhasil didaftarkan!' : 'Data anggota berhasil diperbarui!',
      });

      setTimeout(() => {
        setIsFormOpen(false);
        loadMembers();
      }, 900);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/members/${selectedMember.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghapus anggota');
      }

      setIsDeleteOpen(false);
      loadMembers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      search === '' ||
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.memberNumber.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            Manajemen Anggota Perpustakaan
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Data peminjam buku, nomor kartu anggota, status keanggotaan, dan histori transaksi.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-xs sm:text-sm font-semibold shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Anggota Baru</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari nama, nomor anggota, kelas/unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Hanya Anggota Aktif</option>
            <option value="INACTIVE">Hanya Nonaktif</option>
          </select>
        </div>

        <span className="text-xs text-zinc-500 font-medium">
          Total {filteredMembers.length} anggota ditemukan
        </span>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-zinc-500">Memuat data anggota...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Users className="w-10 h-10 text-zinc-300 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Tidak ada anggota yang cocok
            </h4>
            <p className="text-xs text-zinc-500">Periksa kembali kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">No. Anggota & Nama Lengkap</th>
                  <th className="py-3 px-4">Kelas / Unit Kerja</th>
                  <th className="py-3 px-4">Kontak (Email / Telp)</th>
                  <th className="py-3 px-4 text-center">Buku Sedang Dipinjam</th>
                  <th className="py-3 px-4 text-center">Status Anggota</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                          {m.fullName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {m.fullName}
                          </span>
                          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                            {m.memberNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300 font-medium">
                      {m.department}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-zinc-700 dark:text-zinc-300">{m.email || '-'}</div>
                      <div className="text-[11px] text-zinc-400">{m.phone || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {m.activeLoansCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full text-[11px]">
                          {m.activeLoansCount} buku aktif
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">Tidak ada pinjaman</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openDetailModal(m)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Lihat Riwayat Anggota"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Edit Anggota"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(m);
                            setFeedback(null);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Hapus Anggota"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {formMode === 'create' ? 'Daftarkan Anggota Baru' : 'Edit Data Anggota'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              {feedback && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Nomor Anggota *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.memberNumber}
                    onChange={(e) => setFormData({ ...formData, memberNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Status Anggota *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="ACTIVE">Aktif (Dapat Meminjam)</option>
                    <option value="INACTIVE">Nonaktif (Diblokir/Cuti)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Rizky Pratama"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Kelas / Unit Kerja / Jurusan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: RPL - Kelas XII-B"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Email Siswa/Staff
                  </label>
                  <input
                    type="email"
                    placeholder="nama@student.sch.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Nomor WhatsApp / Telp
                  </label>
                  <input
                    type="tel"
                    placeholder="0812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan keanggotaan atau prestasi..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Kartu Anggota & Riwayat Peminjaman
              </h3>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] tracking-wider uppercase text-zinc-400">
                    Kartu Anggota Perpustakaan
                  </span>
                  <h4 className="text-lg font-bold mt-0.5">{selectedMember.fullName}</h4>
                  <div className="flex items-center gap-3 mt-2 text-zinc-300 text-[11px] font-mono">
                    <span>{selectedMember.memberNumber}</span>
                    <span>•</span>
                    <span>{selectedMember.department}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    selectedMember.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-700 text-zinc-300'
                  }`}>
                    {selectedMember.status === 'ACTIVE' ? 'Status: Aktif' : 'Status: Nonaktif'}
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-2">
                    Gabung: {selectedMember.joinedDate}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Riwayat Peminjaman Anggota ({selectedMember.loans?.length || 0} Transaksi)
                </h5>

                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 font-semibold uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="py-2.5 px-3">Kode TRX</th>
                        <th className="py-2.5 px-3">Buku</th>
                        <th className="py-2.5 px-3">Tgl Pinjam</th>
                        <th className="py-2.5 px-3">Jatuh Tempo</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {!selectedMember.loans || selectedMember.loans.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-zinc-400">
                            Belum pernah melakukan peminjaman buku.
                          </td>
                        </tr>
                      ) : (
                        selectedMember.loans.map((l) => (
                          <tr key={l.id} className="hover:bg-zinc-50/50">
                            <td className="py-2.5 px-3 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                              {l.transactionCode}
                            </td>
                            <td className="py-2.5 px-3 max-w-xs truncate">
                              {l.items.map((i) => i.bookTitle).join(', ')}
                            </td>
                            <td className="py-2.5 px-3">{l.loanDate}</td>
                            <td className="py-2.5 px-3 font-mono">{l.dueDate}</td>
                            <td className="py-2.5 px-3 text-right">
                              <StatusBadge status={l.status} size="sm" />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

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

      {isDeleteOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Hapus Data Anggota?
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Yakin ingin menghapus anggota <strong>&quot;{selectedMember.fullName}&quot;</strong>?
                  Jika anggota masih memiliki buku yang sedang dipinjam atau tanggungan pengembalian, penghapusan akan ditolak. Anda dapat mengubah statusnya menjadi <strong>Nonaktif</strong>.
                </p>
              </div>
            </div>

            {feedback && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {feedback.message}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-300 text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {submitting ? 'Menghapus...' : 'Ya, Hapus Anggota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

