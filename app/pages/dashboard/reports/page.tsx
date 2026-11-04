'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  RotateCcw,
  BookOpen,
  Users,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

type ReportType = 'loans' | 'returns' | 'overdue' | 'collection' | 'members' | 'fines' | 'popular';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('loans');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});

  const loadReport = async () => {
    setLoading(true);
    try {
      const url = `/api/reports?type=${reportType}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setReportData(json.data || []);
        setSummary(json.summary || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportType]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (reportData.length === 0) return;

    let headers: string[] = [];
    let rows: any[][] = [];

    if (reportType === 'loans') {
      headers = ['Kode Transaksi', 'Peminjam', 'No. Anggota', 'Tgl Pinjam', 'Jatuh Tempo', 'Jumlah Buku', 'Status'];
      rows = reportData.map((l) => [
        l.transactionCode,
        `"${l.memberName}"`,
        l.memberNumber,
        l.loanDate,
        l.dueDate,
        l.items.length,
        l.status,
      ]);
    } else if (reportType === 'returns') {
      headers = ['Kode Transaksi', 'Peminjam', 'Judul Buku', 'Tgl Kembali', 'Denda (Rp)'];
      rows = reportData.map((r) => [
        r.transactionCode,
        `"${r.memberName}"`,
        `"${r.bookTitle}"`,
        r.returnedAt,
        r.fineAmount || 0,
      ]);
    } else if (reportType === 'overdue') {
      headers = ['Kode Transaksi', 'Peminjam', 'Buku', 'Jatuh Tempo', 'Status', 'Denda (Rp)'];
      rows = reportData.map((o) => [
        o.transactionCode,
        `"${o.memberName}"`,
        `"${o.items.map((i: any) => i.bookTitle).join(', ')}"`,
        o.dueDate,
        o.status,
        o.totalFine || 0,
      ]);
    } else if (reportType === 'collection') {
      headers = ['Kode Buku', 'Judul Buku', 'Penulis', 'Kategori', 'Lokasi Rak', 'Stok Tersedia', 'Total Eksemplar'];
      rows = reportData.map((b) => [
        b.code,
        `"${b.title}"`,
        `"${b.author}"`,
        `"${b.categoryName}"`,
        b.shelfLocation,
        b.availableCopies,
        b.totalCopies,
      ]);
    } else if (reportType === 'members') {
      headers = ['No. Anggota', 'Nama Lengkap', 'Unit / Kelas', 'Email', 'Telepon', 'Status'];
      rows = reportData.map((m) => [
        m.memberNumber,
        `"${m.fullName}"`,
        `"${m.department}"`,
        m.email || '-',
        m.phone || '-',
        m.status,
      ]);
    } else if (reportType === 'fines') {
      headers = ['Kode Transaksi', 'Peminjam', 'Total Denda (Rp)', 'Status Lunas'];
      rows = reportData.map((f) => [
        f.transactionCode,
        `"${f.memberName}"`,
        f.totalFine,
        f.finePaid ? 'Lunas' : 'Belum Lunas',
      ]);
    } else if (reportType === 'popular') {
      headers = ['Judul Buku', 'Penulis', 'Kategori', 'Frekuensi Dipinjam', 'Stok Tersedia'];
      rows = reportData.map((p) => [
        `"${p.title}"`,
        `"${p.author}"`,
        `"${p.categoryName}"`,
        p.loanCount,
        p.availableCopies,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-perpustakaan-${reportType}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportTabs = [
    { type: 'loans' as const, label: 'Peminjaman', icon: ArrowUpRight },
    { type: 'returns' as const, label: 'Pengembalian', icon: ArrowDownLeft },
    { type: 'overdue' as const, label: 'Keterlambatan', icon: AlertTriangle },
    { type: 'collection' as const, label: 'Koleksi & Stok', icon: BookOpen },
    { type: 'members' as const, label: 'Data Anggota', icon: Users },
    { type: 'popular' as const, label: 'Buku Populer', icon: TrendingUp },
    { type: 'fines' as const, label: 'Kas Denda', icon: DollarSign },
  ];

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Header (hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            Laporan & Rekapitulasi Perpustakaan
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Ekspor rekap data berkala, statistik sirkulasi, dan cetak dokumen resmi perpustakaan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={reportData.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs (hidden in print) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 print:hidden scrollbar-none">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setReportType(tab.type)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date Filter Bar (hidden in print) */}
      {(reportType === 'loans' || reportType === 'returns') && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>Periode:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none"
            />
            <span className="text-zinc-400 text-xs">s/d</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none"
            />
          </div>
          <button
            onClick={loadReport}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold"
          >
            Terapkan Filter
          </button>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setTimeout(loadReport, 100);
              }}
              className="text-xs text-rose-600 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Printable Report Header */}
      <div className="hidden print:block text-center border-b pb-4 mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wider">
          Perpustakaan Digital Arsip
        </h1>
        <p className="text-xs text-zinc-600">
          Laporan Rekapitulasi: {reportTabs.find((t) => t.type === reportType)?.label}
        </p>
        <p className="text-[10px] text-zinc-400 font-mono mt-1">
          Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportType === 'loans' && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-zinc-400 font-medium">Total Transaksi</span>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {summary.totalTransactions || 0}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-zinc-400 font-medium">Total Buku Dipinjam</span>
              <div className="text-xl font-bold text-blue-600 mt-1">
                {summary.totalBooksLoaned || 0}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-zinc-400 font-medium">Pinjaman Aktif</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {summary.activeLoans || 0}
              </div>
            </div>
          </>
        )}

        {reportType === 'returns' && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-zinc-400 font-medium">Buku Dikembalikan</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {summary.totalReturnedBooks || 0}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-zinc-400 font-medium">Denda Diterima</span>
              <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                Rp {(summary.totalFinesCollected || 0).toLocaleString('id-ID')}
              </div>
            </div>
          </>
        )}

        {reportType === 'overdue' && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-zinc-400 font-medium">Transaksi Terlambat</span>
              <div className="text-xl font-bold text-rose-600 mt-1">
                {summary.totalOverdueTransactions || 0}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-zinc-400 font-medium">Item Buku Tertahan</span>
              <div className="text-xl font-bold text-amber-600 mt-1">
                {summary.totalOverdueItems || 0}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-zinc-400 font-medium">Estimasi Total Denda</span>
              <div className="text-xl font-bold font-mono text-rose-600 mt-1">
                Rp {(summary.estimatedTotalFines || 0).toLocaleString('id-ID')}
              </div>
            </div>
          </>
        )}

        {reportType === 'collection' && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-zinc-400 font-medium">Judul Buku Unik</span>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {summary.totalTitles || 0}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-zinc-400 font-medium">Total Eksemplar</span>
              <div className="text-xl font-bold text-blue-600 mt-1">
                {summary.totalCopies || 0}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-zinc-400 font-medium">Tersedia di Rak</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {summary.availableCopies || 0}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs text-zinc-400 font-medium">Sedang Dipinjam</span>
              <div className="text-xl font-bold text-amber-600 mt-1">
                {summary.borrowedCopies || 0}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Report Data Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-zinc-500">Menyusun data laporan...</p>
          </div>
        ) : reportData.length === 0 ? (
          <div className="p-16 text-center text-xs text-zinc-400">
            Tidak ada rekaman data pada laporan ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                {reportType === 'loans' && (
                  <tr>
                    <th className="py-3 px-4">No. Transaksi</th>
                    <th className="py-3 px-4">Peminjam</th>
                    <th className="py-3 px-4">Buku Dipinjam</th>
                    <th className="py-3 px-4">Tgl Pinjam</th>
                    <th className="py-3 px-4">Jatuh Tempo</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                )}
                {reportType === 'returns' && (
                  <tr>
                    <th className="py-3 px-4">No. Transaksi</th>
                    <th className="py-3 px-4">Peminjam</th>
                    <th className="py-3 px-4">Judul Buku</th>
                    <th className="py-3 px-4">Tgl Kembali</th>
                    <th className="py-3 px-4 text-right">Denda Terkumpul</th>
                  </tr>
                )}
                {reportType === 'overdue' && (
                  <tr>
                    <th className="py-3 px-4">No. Transaksi</th>
                    <th className="py-3 px-4">Peminjam</th>
                    <th className="py-3 px-4">Buku Terlambat</th>
                    <th className="py-3 px-4">Jatuh Tempo</th>
                    <th className="py-3 px-4 text-right">Estimasi Denda</th>
                  </tr>
                )}
                {reportType === 'collection' && (
                  <tr>
                    <th className="py-3 px-4">Kode & Judul</th>
                    <th className="py-3 px-4">Penulis</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Rak</th>
                    <th className="py-3 px-4 text-center">Tersedia / Total</th>
                  </tr>
                )}
                {reportType === 'members' && (
                  <tr>
                    <th className="py-3 px-4">No. Anggota & Nama</th>
                    <th className="py-3 px-4">Unit / Kelas</th>
                    <th className="py-3 px-4">Kontak</th>
                    <th className="py-3 px-4">Tgl Terdaftar</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                )}
                {reportType === 'popular' && (
                  <tr>
                    <th className="py-3 px-4">Peringkat & Judul</th>
                    <th className="py-3 px-4">Penulis</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-center">Dipinjam</th>
                    <th className="py-3 px-4 text-right">Sisa Stok</th>
                  </tr>
                )}
                {reportType === 'fines' && (
                  <tr>
                    <th className="py-3 px-4">No. Transaksi</th>
                    <th className="py-3 px-4">Peminjam</th>
                    <th className="py-3 px-4">Jatuh Tempo</th>
                    <th className="py-3 px-4 text-right">Nominal Denda</th>
                    <th className="py-3 px-4 text-right">Status Kas</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {reportType === 'loans' &&
                  reportData.map((l) => (
                    <tr key={l.id} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-4 font-mono font-medium">{l.transactionCode}</td>
                      <td className="py-3 px-4 font-semibold">{l.memberName}</td>
                      <td className="py-3 px-4">{l.items.map((i: any) => i.bookTitle).join(', ')}</td>
                      <td className="py-3 px-4">{l.loanDate}</td>
                      <td className="py-3 px-4 font-mono">{l.dueDate}</td>
                      <td className="py-3 px-4 text-right">
                        <StatusBadge status={l.status} size="sm" />
                      </td>
                    </tr>
                  ))}

                {reportType === 'returns' &&
                  reportData.map((r, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-4 font-mono">{r.transactionCode}</td>
                      <td className="py-3 px-4 font-semibold">{r.memberName}</td>
                      <td className="py-3 px-4">{r.bookTitle}</td>
                      <td className="py-3 px-4 font-mono">{r.returnedAt}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        Rp {(r.fineAmount || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}

                {reportType === 'overdue' &&
                  reportData.map((o) => (
                    <tr key={o.id} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-4 font-mono font-medium">{o.transactionCode}</td>
                      <td className="py-3 px-4 font-semibold">{o.memberName}</td>
                      <td className="py-3 px-4">{o.items.map((i: any) => i.bookTitle).join(', ')}</td>
                      <td className="py-3 px-4 font-mono text-rose-600 font-bold">{o.dueDate}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                        Rp {o.totalFine.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}

                {reportType === 'collection' &&
                  reportData.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-4">
                        <span className="font-semibold">{b.title}</span>
                        <span className="text-[10px] text-zinc-400 font-mono ml-2">[{b.code}]</span>
                      </td>
                      <td className="py-3 px-4">{b.author}</td>
                      <td className="py-3 px-4">{b.categoryName}</td>
                      <td className="py-3 px-4 font-mono">{b.shelfLocation}</td>
                      <td className="py-3 px-4 text-center font-bold">
                        {b.availableCopies} / {b.totalCopies}
                      </td>
                    </tr>
                  ))}

                {reportType === 'members' &&
                  reportData.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-4">
                        <span className="font-semibold">{m.fullName}</span>
                        <span className="text-[10px] text-zinc-400 font-mono ml-2">({m.memberNumber})</span>
                      </td>
                      <td className="py-3 px-4">{m.department}</td>
                      <td className="py-3 px-4">{m.email || m.phone}</td>
                      <td className="py-3 px-4 font-mono">{m.joinedDate}</td>
                      <td className="py-3 px-4 text-right">
                        <StatusBadge status={m.status} size="sm" />
                      </td>
                    </tr>
                  ))}

                {reportType === 'popular' &&
                  reportData.map((p, i) => (
                    <tr key={p.bookId} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-4 font-semibold">
                        #{i + 1} {p.title}
                      </td>
                      <td className="py-3 px-4">{p.author}</td>
                      <td className="py-3 px-4">{p.categoryName}</td>
                      <td className="py-3 px-4 text-center font-bold text-blue-600">
                        {p.loanCount} Kali
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.availableCopies} dari {p.totalCopies}
                      </td>
                    </tr>
                  ))}

                {reportType === 'fines' &&
                  reportData.map((f) => (
                    <tr key={f.id} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-4 font-mono">{f.transactionCode}</td>
                      <td className="py-3 px-4 font-semibold">{f.memberName}</td>
                      <td className="py-3 px-4 font-mono">{f.dueDate}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                        Rp {f.totalFine.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <StatusBadge status={f.finePaid ? 'LUNAS' : 'BELUM LUNAS'} size="sm" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

