import { Book, Category, Member, Loan, LibrarySettings } from '../types';

export const initialSettings: LibrarySettings = {
  libraryName: "Arsip Perpustakaan Digital",
  defaultLoanDurationDays: 7,
  maxBooksPerMember: 3,
  fineRatePerDay: 1000,
  isFineEnabled: true,
  address: "Jl. Pendidikan No. 45, Jakarta",
  contactPhone: "+62 812-3456-7890",
  contactEmail: "perpustakaan@arsip.sch.id",
  notes: "Batas peminjaman standar 7 hari kalender. Keterlambatan dikenakan denda Rp 1.000/hari/buku."
};

export const initialCategories: Category[] = [
  { id: "cat-1", name: "Pemrograman & IT", description: "Buku seputar software engineering, coding, dan arsitektur sistem", createdAt: "2026-01-10T08:00:00Z" },
  { id: "cat-2", name: "Sains & Teknologi", description: "Karya ilmiah, matematika, fisika, dan inovasi teknologi", createdAt: "2026-01-10T08:00:00Z" },
  { id: "cat-3", name: "Fiksi & Sastra", description: "Novel, cerpen, puisi, dan karya fiksi sastra dunia maupun nusantara", createdAt: "2026-01-12T08:00:00Z" },
  { id: "cat-4", name: "Bisnis & Manajemen", description: "Pengembangan diri, ekonomi, manajemen, dan produktivitas", createdAt: "2026-01-15T08:00:00Z" },
  { id: "cat-5", name: "Sejarah & Sosial", description: "Perjalanan sejarah peradaban, antropologi, dan studi sosial", createdAt: "2026-01-18T08:00:00Z" },
  { id: "cat-6", name: "Pendidikan & Referensi", description: "Ensiklopedia, kamus, dan modul pembelajaran", createdAt: "2026-01-20T08:00:00Z" },
];

export const initialBooks: Book[] = [
  {
    id: "bk-1",
    isbn: "978-0132350884",
    code: "BK-001",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    publisher: "Prentice Hall",
    publishYear: 2008,
    categoryId: "cat-1",
    description: "Pedoman mendalam tentang cara menulis kode yang bersih, mudah dirawat, dan teruji dengan baik.",
    shelfLocation: "Rak IT-01",
    totalCopies: 5,
    availableCopies: 3,
    borrowedCopies: 2,
    createdAt: "2026-01-25T09:00:00Z",
    updatedAt: "2026-10-20T10:00:00Z"
  },
  {
    id: "bk-2",
    isbn: "978-0201485677",
    code: "BK-002",
    title: "Refactoring: Improving the Design of Existing Code",
    author: "Martin Fowler",
    publisher: "Addison-Wesley",
    publishYear: 2018,
    categoryId: "cat-1",
    description: "Teknik restrukturisasi kode yang ada tanpa mengubah perilaku eksternalnya untuk meningkatkan arsitektur.",
    shelfLocation: "Rak IT-01",
    totalCopies: 4,
    availableCopies: 2,
    borrowedCopies: 2,
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-10-21T10:00:00Z"
  },
  {
    id: "bk-3",
    isbn: "978-9791227025",
    code: "BK-003",
    title: "Laskar Pelangi",
    author: "Andrea Hirata",
    publisher: "Bentang Pustaka",
    publishYear: 2005,
    categoryId: "cat-3",
    description: "Kisah inspiratif sepuluh anak Belitung dalam memperjuangkan hak pendidikan mereka.",
    shelfLocation: "Rak SA-02",
    totalCopies: 6,
    availableCopies: 4,
    borrowedCopies: 2,
    createdAt: "2026-02-05T09:00:00Z",
    updatedAt: "2026-10-22T10:00:00Z"
  },
  {
    id: "bk-4",
    isbn: "978-9799731234",
    code: "BK-004",
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    publisher: "Hasta Mitra",
    publishYear: 1980,
    categoryId: "cat-3",
    description: "Roman tetralogi Buru yang merekam pergulatan nasionalisme, humanisme, dan peradaban di awal abad 20.",
    shelfLocation: "Rak SA-02",
    totalCopies: 4,
    availableCopies: 1,
    borrowedCopies: 3,
    createdAt: "2026-02-10T09:00:00Z",
    updatedAt: "2026-10-23T10:00:00Z"
  },
  {
    id: "bk-5",
    isbn: "978-0062316097",
    code: "BK-005",
    title: "Sapiens: Riwayat Singkat Umat Manusia",
    author: "Yuval Noah Harari",
    publisher: "Kepustakaan Populer Gramedia",
    publishYear: 2014,
    categoryId: "cat-5",
    description: "Penjelajahan bagaimana kera tak berarti bisa menjadi penguasa planet Bumi melalui tiga revolusi besar.",
    shelfLocation: "Rak SJ-01",
    totalCopies: 5,
    availableCopies: 4,
    borrowedCopies: 1,
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-10-24T10:00:00Z"
  },
  {
    id: "bk-6",
    isbn: "978-0735211292",
    code: "BK-006",
    title: "Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa",
    author: "James Clear",
    publisher: "Gramedia Pustaka Utama",
    publishYear: 2018,
    categoryId: "cat-4",
    description: "Kerangka terbukti untuk memperbaiki kebiasaan setiap hari melalui sistem 1% lebih baik.",
    shelfLocation: "Rak BM-03",
    totalCopies: 8,
    availableCopies: 6,
    borrowedCopies: 2,
    createdAt: "2026-02-20T09:00:00Z",
    updatedAt: "2026-10-25T10:00:00Z"
  },
  {
    id: "bk-7",
    isbn: "978-0201633610",
    code: "BK-007",
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    publisher: "Addison-Wesley",
    publishYear: 1994,
    categoryId: "cat-1",
    description: "23 pola desain klasik berorientasi objek yang menjadi standar industri software engineering.",
    shelfLocation: "Rak IT-02",
    totalCopies: 3,
    availableCopies: 1,
    borrowedCopies: 2,
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-10-25T10:00:00Z"
  },
  {
    id: "bk-8",
    isbn: "978-0596517748",
    code: "BK-008",
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    publisher: "O'Reilly Media",
    publishYear: 2008,
    categoryId: "cat-1",
    description: "Membongkar esensi bahasa JavaScript dari fitur terbaik hingga jebakan yang perlu dihindari.",
    shelfLocation: "Rak IT-02",
    totalCopies: 2,
    availableCopies: 0,
    borrowedCopies: 2,
    createdAt: "2026-03-05T09:00:00Z",
    updatedAt: "2026-10-26T10:00:00Z"
  },
  {
    id: "bk-9",
    isbn: "978-0553380163",
    code: "BK-009",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    publisher: "Bantam Books",
    publishYear: 1988,
    categoryId: "cat-2",
    description: "Penjelasan kosmologi modern mengenai Big Bang, lubang hitam, dan teori relativitas umum.",
    shelfLocation: "Rak SN-01",
    totalCopies: 4,
    availableCopies: 3,
    borrowedCopies: 1,
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-10-26T10:00:00Z"
  },
  {
    id: "bk-10",
    isbn: "978-9792275810",
    code: "BK-010",
    title: "Negeri 5 Menara",
    author: "A. Fuadi",
    publisher: "Gramedia Pustaka Utama",
    publishYear: 2009,
    categoryId: "cat-3",
    description: "Mantra Man Jadda Wajada yang mengiringi perjuangan enam santri meraih impian dunia.",
    shelfLocation: "Rak SA-03",
    totalCopies: 5,
    availableCopies: 5,
    borrowedCopies: 0,
    createdAt: "2026-03-15T09:00:00Z",
    updatedAt: "2026-10-26T10:00:00Z"
  }
];

export const initialMembers: Member[] = [
  {
    id: "mem-1",
    memberNumber: "LIB-2026-001",
    fullName: "Ahmad Rizky Pratama",
    email: "ahmad.rizky@student.sch.id",
    phone: "0812-9876-5432",
    department: "RPL - Kelas XII-B",
    joinedDate: "2026-01-15",
    status: "ACTIVE",
    notes: "Ketua ekstrakurikuler coding club",
    createdAt: "2026-01-15T09:00:00Z"
  },
  {
    id: "mem-2",
    memberNumber: "LIB-2026-002",
    fullName: "Siti Nurhaliza",
    email: "siti.nurhaliza@student.sch.id",
    phone: "0813-1122-3344",
    department: "TKJ - Kelas XI-A",
    joinedDate: "2026-01-18",
    status: "ACTIVE",
    notes: "Peminjam aktif buku fiksi sastra",
    createdAt: "2026-01-18T09:00:00Z"
  },
  {
    id: "mem-3",
    memberNumber: "LIB-2026-003",
    fullName: "Budi Santoso",
    email: "budi.santoso@student.sch.id",
    phone: "0857-4433-2211",
    department: "MM - Kelas XII-A",
    joinedDate: "2026-02-01",
    status: "ACTIVE",
    notes: "Anggota tim jurnalistik sekolah",
    createdAt: "2026-02-01T09:00:00Z"
  },
  {
    id: "mem-4",
    memberNumber: "LIB-2026-004",
    fullName: "Dewi Lestari",
    email: "dewi.lestari@student.sch.id",
    phone: "0878-9900-1122",
    department: "RPL - Kelas XI-B",
    joinedDate: "2026-02-10",
    status: "ACTIVE",
    notes: "Minat pada arsitektur web modern",
    createdAt: "2026-02-10T09:00:00Z"
  },
  {
    id: "mem-5",
    memberNumber: "LIB-2026-005",
    fullName: "Farhan Maulana",
    email: "farhan.m@student.sch.id",
    phone: "0821-5566-7788",
    department: "SIJA - Kelas XII-C",
    joinedDate: "2026-02-14",
    status: "ACTIVE",
    notes: "Sering membaca buku sejarah dan sains",
    createdAt: "2026-02-14T09:00:00Z"
  },
  {
    id: "mem-6",
    memberNumber: "LIB-2026-006",
    fullName: "Gita Safitri",
    email: "gita.s@student.sch.id",
    phone: "0819-2233-4455",
    department: "RPL - Kelas XII-B",
    joinedDate: "2026-03-01",
    status: "INACTIVE",
    notes: "Sedang cuti praktek kerja lapangan (PKL)",
    createdAt: "2026-03-01T09:00:00Z"
  }
];

// Helper to calculate realistic past/future dates based on today
function createDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const initialLoans: Loan[] = [
  {
    id: "trx-1",
    transactionCode: "TRX-202610-001",
    memberId: "mem-1",
    memberName: "Ahmad Rizky Pratama",
    memberNumber: "LIB-2026-001",
    memberDepartment: "RPL - Kelas XII-B",
    loanDate: createDateString(-12),
    dueDate: createDateString(-5), // Overdue by 5 days
    actualReturnDate: null,
    processedBy: "Admin Perpustakaan",
    status: "OVERDUE",
    totalFine: 10000, // 5 days * 1000 * 2 books
    finePaid: false,
    notes: "Telah dikirim peringatan jatuh tempo via email",
    items: [
      {
        id: "item-1-1",
        loanId: "trx-1",
        bookId: "bk-1",
        bookTitle: "Clean Code: A Handbook of Agile Software Craftsmanship",
        bookCode: "BK-001",
        isbn: "978-0132350884",
        status: "OVERDUE",
        returnedAt: null,
        fineAmount: 5000,
        notes: "Melewati batas kembali 5 hari"
      },
      {
        id: "item-1-2",
        loanId: "trx-1",
        bookId: "bk-7",
        bookTitle: "Design Patterns: Elements of Reusable Object-Oriented Software",
        bookCode: "BK-007",
        isbn: "978-0201633610",
        status: "OVERDUE",
        returnedAt: null,
        fineAmount: 5000,
        notes: "Melewati batas kembali 5 hari"
      }
    ],
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "trx-2",
    transactionCode: "TRX-202610-002",
    memberId: "mem-2",
    memberName: "Siti Nurhaliza",
    memberNumber: "LIB-2026-002",
    memberDepartment: "TKJ - Kelas XI-A",
    loanDate: createDateString(-4),
    dueDate: createDateString(3), // Active, due in 3 days
    actualReturnDate: null,
    processedBy: "Admin Perpustakaan",
    status: "ACTIVE",
    totalFine: 0,
    finePaid: false,
    notes: "Peminjaman reguler",
    items: [
      {
        id: "item-2-1",
        loanId: "trx-2",
        bookId: "bk-3",
        bookTitle: "Laskar Pelangi",
        bookCode: "BK-003",
        isbn: "978-9791227025",
        status: "BORROWED",
        returnedAt: null,
        fineAmount: 0
      },
      {
        id: "item-2-2",
        loanId: "trx-2",
        bookId: "bk-4",
        bookTitle: "Bumi Manusia",
        bookCode: "BK-004",
        isbn: "978-9799731234",
        status: "BORROWED",
        returnedAt: null,
        fineAmount: 0
      }
    ],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "trx-3",
    transactionCode: "TRX-202610-003",
    memberId: "mem-3",
    memberName: "Budi Santoso",
    memberNumber: "LIB-2026-003",
    memberDepartment: "MM - Kelas XII-A",
    loanDate: createDateString(-6),
    dueDate: createDateString(1), // Due tomorrow! (dueSoon alert)
    actualReturnDate: null,
    processedBy: "Admin Perpustakaan",
    status: "PARTIAL",
    totalFine: 0,
    finePaid: false,
    notes: "1 buku sudah dikembalikan terlebih dahulu",
    items: [
      {
        id: "item-3-1",
        loanId: "trx-3",
        bookId: "bk-6",
        bookTitle: "Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa",
        bookCode: "BK-006",
        isbn: "978-0735211292",
        status: "RETURNED",
        returnedAt: createDateString(-1),
        fineAmount: 0,
        notes: "Kondisi buku sangat baik"
      },
      {
        id: "item-3-2",
        loanId: "trx-3",
        bookId: "bk-4",
        bookTitle: "Bumi Manusia",
        bookCode: "BK-004",
        isbn: "978-9799731234",
        status: "BORROWED",
        returnedAt: null,
        fineAmount: 0
      }
    ],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "trx-4",
    transactionCode: "TRX-202610-004",
    memberId: "mem-4",
    memberName: "Dewi Lestari",
    memberNumber: "LIB-2026-004",
    memberDepartment: "RPL - Kelas XI-B",
    loanDate: createDateString(-2),
    dueDate: createDateString(5), // Active
    actualReturnDate: null,
    processedBy: "Admin Perpustakaan",
    status: "ACTIVE",
    totalFine: 0,
    finePaid: false,
    notes: "Peminjaman modul coding",
    items: [
      {
        id: "item-4-1",
        loanId: "trx-4",
        bookId: "bk-2",
        bookTitle: "Refactoring: Improving the Design of Existing Code",
        bookCode: "BK-002",
        isbn: "978-0201485677",
        status: "BORROWED",
        returnedAt: null,
        fineAmount: 0
      },
      {
        id: "item-4-2",
        loanId: "trx-4",
        bookId: "bk-8",
        bookTitle: "JavaScript: The Good Parts",
        bookCode: "BK-008",
        isbn: "978-0596517748",
        status: "BORROWED",
        returnedAt: null,
        fineAmount: 0
      }
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "trx-5",
    transactionCode: "TRX-202610-005",
    memberId: "mem-5",
    memberName: "Farhan Maulana",
    memberNumber: "LIB-2026-005",
    memberDepartment: "SIJA - Kelas XII-C",
    loanDate: createDateString(-20),
    dueDate: createDateString(-13),
    actualReturnDate: createDateString(-11), // Returned with 2 days late
    processedBy: "Admin Perpustakaan",
    status: "RETURNED",
    totalFine: 2000,
    finePaid: true,
    notes: "Denda Rp 2.000 telah lunas via tunai kasir perpustakaan",
    items: [
      {
        id: "item-5-1",
        loanId: "trx-5",
        bookId: "bk-5",
        bookTitle: "Sapiens: Riwayat Singkat Umat Manusia",
        bookCode: "BK-005",
        isbn: "978-0062316097",
        status: "RETURNED",
        returnedAt: createDateString(-11),
        fineAmount: 2000,
        notes: "Terlambat 2 hari, denda dilunasi"
      }
    ],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 86400000).toISOString()
  }
];

