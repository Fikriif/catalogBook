'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowUpDown,
  BookCopy,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Book, Category } from '@/lib/types';

export default function BooksPage() {
  const [books, setBooks] = useState<(Book & { categoryName: string })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');
  const [sortBy, setSortBy] = useState<'title' | 'code' | 'stock' | 'year'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<(Book & { categoryName: string }) | null>(null);

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    code: '',
    isbn: '',
    publisher: '',
    publishYear: new Date().getFullYear(),
    categoryId: '',
    shelfLocation: '',
    totalCopies: 1,
    description: '',
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookRes, catRes] = await Promise.all([
        fetch('/api/books').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);

      if (bookRes.success) setBooks(bookRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setFormMode('create');
    setFormData({
      title: '',
      author: '',
      code: `BK-${Math.floor(100 + Math.random() * 900)}`,
      isbn: `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      publisher: '',
      publishYear: new Date().getFullYear(),
      categoryId: categories[0]?.id || '',
      shelfLocation: 'Rak IT-01',
      totalCopies: 3,
      description: '',
    });
    setFeedback(null);
    setIsFormOpen(true);
  };

  const openEditModal = (b: Book & { categoryName: string }) => {
    setFormMode('edit');
    setSelectedBook(b);
    setFormData({
      title: b.title,
      author: b.author,
      code: b.code,
      isbn: b.isbn,
      publisher: b.publisher,
      publishYear: b.publishYear,
      categoryId: b.categoryId,
      shelfLocation: b.shelfLocation,
      totalCopies: b.totalCopies,
      description: b.description || '',
    });
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFeedback(null);

    try {
      const url = formMode === 'create' ? '/api/books' : `/api/books/${selectedBook?.id}`;
      const method = formMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan buku');
      }

      setFeedback({
        type: 'success',
        message: formMode === 'create' ? 'Buku berhasil ditambahkan!' : 'Perubahan data buku berhasil disimpan!',
      });

      setTimeout(() => {
        setIsFormOpen(false);
        loadData();
      }, 1000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBook) return;
    setFormSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/books/${selectedBook.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghapus buku');
      }

      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredBooks = books
    .filter((b) => {
      const matchesSearch =
        search === '' ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.code.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn.toLowerCase().includes(search.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || b.categoryId === selectedCategory;

      const matchesAvail =
        selectedAvailability === 'ALL' ||
        (selectedAvailability === 'AVAILABLE' && b.availableCopies > 0) ||
        (selectedAvailability === 'OUT' && b.availableCopies === 0);

      return matchesSearch && matchesCat && matchesAvail;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'title') comparison = a.title.localeCompare(b.title);
      else if (sortBy === 'code') comparison = a.code.localeCompare(b.code);
      else if (sortBy === 'stock') comparison = a.availableCopies - b.availableCopies;
      else if (sortBy === 'year') comparison = a.publishYear - b.publishYear;

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage) || 1;
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Manajemen Koleksi Buku
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Kelola judul, nomor panggil, eksemplar, dan status ketersediaan buku di perpustakaan.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-xs sm:text-sm font-semibold shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Buku Baru</span>
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari judul, penulis, ISBN, atau kode..."
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
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedAvailability}
              onChange={(e) => {
                setSelectedAvailability(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">Semua Ketersediaan</option>
              <option value="AVAILABLE">Tersedia di Rak (&gt; 0)</option>
              <option value="OUT">Habis / Sedang Dipinjam Semua</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="title">Urut: Judul Buku</option>
              <option value="code">Urut: Kode Buku</option>
              <option value="stock">Urut: Stok Tersedia</option>
              <option value="year">Urut: Tahun Terbit</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title={sortOrder === 'asc' ? 'Menaik (Asc)' : 'Menurun (Desc)'}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span>Menampilkan {filteredBooks.length} judul buku yang sesuai</span>
          <span>Halaman {currentPage} dari {totalPages}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-zinc-500">Memuat data katalog buku...</p>
          </div>
        ) : paginatedBooks.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-zinc-300 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Tidak ada buku yang ditemukan
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau ubah filter kategori/ketersediaan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Kode & Judul Buku</th>
                  <th className="py-3 px-4">Penulis & Penerbit</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Lokasi Rak</th>
                  <th className="py-3 px-4 text-center">Eksemplar (Tersedia / Total)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {paginatedBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-10 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                          <BookOpen className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                            {b.title}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400 font-mono">
                            <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded text-zinc-600 dark:text-zinc-300 font-bold">
                              {b.code}
                            </span>
                            <span>•</span>
                            <span>ISBN: {b.isbn}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-zinc-800 dark:text-zinc-200 font-medium">{b.author}</div>
                      <div className="text-[11px] text-zinc-400">
                        {b.publisher} ({b.publishYear})
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {b.categoryName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-700 dark:text-zinc-300">
                      {b.shelfLocation}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {b.availableCopies}
                      </span>
                      <span className="text-zinc-400"> / {b.totalCopies}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={b.availableCopies > 0 ? 'TERSEDIA' : 'DIPINJAM'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedBook(b);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Edit Buku"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBook(b);
                            setFeedback(null);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Hapus Buku"
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
            <span className="text-zinc-500">
              Menampilkan {paginatedBooks.length} dari {filteredBooks.length} buku
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

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {formMode === 'create' ? 'Tambah Judul Buku Baru' : 'Edit Data Buku'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {feedback && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400'
                      : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400'
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

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Judul Buku *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Clean Code"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Penulis *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Robert C. Martin"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Penerbit *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="Prentice Hall"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Kode Buku *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="BK-001"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="978-0132350884"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Tahun Terbit
                  </label>
                  <input
                    type="number"
                    value={formData.publishYear}
                    onChange={(e) => setFormData({ ...formData, publishYear: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Kategori *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Lokasi Rak *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shelfLocation}
                    onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                    placeholder="Rak IT-01"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Total Eksemplar *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Deskripsi / Sinopsis
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ringkasan isi buku atau catatan pengadaan..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {formSubmitting ? 'Menyimpan...' : 'Simpan Data Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailOpen && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Informasi Bibliografi Buku
              </h3>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-400">Judul Buku</span>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {selectedBook.title}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <div>
                  <span className="text-zinc-400">Kode Buku:</span>
                  <p className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{selectedBook.code}</p>
                </div>
                <div>
                  <span className="text-zinc-400">ISBN:</span>
                  <p className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{selectedBook.isbn}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Penulis:</span>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedBook.author}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Penerbit & Tahun:</span>
                  <p className="text-zinc-800 dark:text-zinc-200">{selectedBook.publisher} ({selectedBook.publishYear})</p>
                </div>
                <div>
                  <span className="text-zinc-400">Kategori:</span>
                  <p className="text-zinc-800 dark:text-zinc-200">{selectedBook.categoryName}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Lokasi Rak:</span>
                  <p className="font-mono text-zinc-800 dark:text-zinc-200">{selectedBook.shelfLocation}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between">
                <div>
                  <span className="text-blue-900 dark:text-blue-300 font-bold">Ketersediaan Eksemplar</span>
                  <p className="text-blue-700 dark:text-blue-400 text-[11px] mt-0.5">
                    {selectedBook.availableCopies} buku siap dipinjam, {selectedBook.borrowedCopies} sedang di luar.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-blue-700 dark:text-blue-300">
                    {selectedBook.availableCopies}/{selectedBook.totalCopies}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-400">Sinopsis / Catatan</span>
                <p className="text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                  {selectedBook.description || 'Tidak ada deskripsi tambahan.'}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Hapus Judul Buku?
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Apakah Anda yakin ingin menghapus <strong>&quot;{selectedBook.title}&quot;</strong>?
                  Penghapusan akan ditolak otomatis jika buku masih memiliki eksemplar yang sedang dipinjam.
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
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={formSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {formSubmitting ? 'Menghapus...' : 'Ya, Hapus Buku'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

