import fs from 'fs';
import path from 'path';
import {
  Book,
  Category,
  Member,
  Loan,
  LoanItem,
  LibrarySettings,
  DashboardStats,
} from '../types';
import {
  initialBooks,
  initialCategories,
  initialMembers,
  initialLoans,
  initialSettings,
} from '../data/initial-data';

interface DatabaseSchema {
  settings: LibrarySettings;
  categories: Category[];
  books: Book[];
  members: Member[];
  loans: Loan[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'library-db.json');

// In-memory fallback if fs fails
let memoryDb: DatabaseSchema | null = null;

function loadDatabase(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      memoryDb = JSON.parse(data);
      return memoryDb!;
    }
  } catch (err) {
    console.warn('Could not read from disk DB, using memory seed:', err);
  }

  // Initialize with initial data
  memoryDb = {
    settings: { ...initialSettings },
    categories: [...initialCategories],
    books: [...initialBooks],
    members: [...initialMembers],
    loans: [...initialLoans],
  };

  saveDatabase(memoryDb);
  return memoryDb;
}

function saveDatabase(db: DatabaseSchema) {
  memoryDb = db;
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist to disk, persisted in-memory only:', err);
  }
}

// Helper: refresh dynamic overdue statuses on read
function refreshLoanOverdueStatus(loan: Loan, fineRatePerDay: number, isFineEnabled: boolean): Loan {
  const todayStr = new Date().toISOString().split('T')[0];
  const isPastDue = loan.dueDate < todayStr;

  let hasUnreturned = false;
  let hasReturned = false;
  let dynamicFine = 0;

  const updatedItems = loan.items.map((item) => {
    if (item.status === 'RETURNED') {
      hasReturned = true;
      dynamicFine += item.fineAmount || 0;
      return item;
    }

    hasUnreturned = true;
    if (isPastDue) {
      const due = new Date(loan.dueDate).getTime();
      const now = new Date(todayStr).getTime();
      const diffDays = Math.max(0, Math.ceil((now - due) / (1000 * 60 * 60 * 24)));
      const fine = isFineEnabled ? diffDays * fineRatePerDay : 0;
      dynamicFine += fine;
      return {
        ...item,
        status: 'OVERDUE' as const,
        fineAmount: fine,
      };
    } else {
      return {
        ...item,
        status: 'BORROWED' as const,
        fineAmount: 0,
      };
    }
  });

  let computedStatus: Loan['status'] = loan.status;
  if (!hasUnreturned) {
    computedStatus = 'RETURNED';
  } else if (isPastDue) {
    computedStatus = 'OVERDUE';
  } else if (hasReturned) {
    computedStatus = 'PARTIAL';
  } else {
    computedStatus = 'ACTIVE';
  }

  return {
    ...loan,
    items: updatedItems,
    status: computedStatus,
    totalFine: dynamicFine,
  };
}

export const libraryService = {
  // SETTINGS
  getSettings(): LibrarySettings {
    const db = loadDatabase();
    return db.settings;
  },

  updateSettings(newSettings: Partial<LibrarySettings>): LibrarySettings {
    const db = loadDatabase();
    db.settings = { ...db.settings, ...newSettings };
    saveDatabase(db);
    return db.settings;
  },

  // CATEGORIES
  getCategories(): Category[] {
    const db = loadDatabase();
    return [...db.categories].sort((a, b) => a.name.localeCompare(b.name));
  },

  getCategoryWithCount(): (Category & { bookCount: number })[] {
    const db = loadDatabase();
    return db.categories.map((cat) => {
      const count = db.books.filter((b) => b.categoryId === cat.id).length;
      return {
        ...cat,
        bookCount: count,
      };
    });
  },

  createCategory(data: Omit<Category, 'id' | 'createdAt'>): Category {
    const db = loadDatabase();
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: data.name.trim(),
      description: data.description.trim(),
      createdAt: new Date().toISOString(),
    };
    db.categories.push(newCategory);
    saveDatabase(db);
    return newCategory;
  },

  updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>): Category {
    const db = loadDatabase();
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Kategori tidak ditemukan');

    db.categories[index] = {
      ...db.categories[index],
      ...data,
      name: data.name ? data.name.trim() : db.categories[index].name,
      description: data.description !== undefined ? data.description.trim() : db.categories[index].description,
    };
    saveDatabase(db);
    return db.categories[index];
  },

  deleteCategory(id: string): { success: boolean; message?: string } {
    const db = loadDatabase();
    const booksUsingCategory = db.books.filter((b) => b.categoryId === id);
    if (booksUsingCategory.length > 0) {
      throw new Error(`Kategori tidak dapat dihapus karena masih digunakan oleh ${booksUsingCategory.length} judul buku.`);
    }

    db.categories = db.categories.filter((c) => c.id !== id);
    saveDatabase(db);
    return { success: true };
  },

  // BOOKS
  getBooks(filters?: { search?: string; categoryId?: string; availability?: 'ALL' | 'AVAILABLE' | 'BORROWED_OUT' }): (Book & { categoryName: string })[] {
    const db = loadDatabase();
    const catMap = new Map(db.categories.map((c) => [c.id, c.name]));

    let books = db.books.map((b) => ({
      ...b,
      categoryName: catMap.get(b.categoryId) || 'Lainnya',
    }));

    if (filters?.categoryId && filters.categoryId !== 'ALL') {
      books = books.filter((b) => b.categoryId === filters.categoryId);
    }

    if (filters?.availability === 'AVAILABLE') {
      books = books.filter((b) => b.availableCopies > 0);
    } else if (filters?.availability === 'BORROWED_OUT') {
      books = books.filter((b) => b.availableCopies === 0);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      books = books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q)
      );
    }

    return books.sort((a, b) => a.title.localeCompare(b.title));
  },

  getBookById(id: string): (Book & { categoryName: string }) | null {
    const db = loadDatabase();
    const book = db.books.find((b) => b.id === id);
    if (!book) return null;
    const cat = db.categories.find((c) => c.id === book.categoryId);
    return {
      ...book,
      categoryName: cat?.name || 'Lainnya',
    };
  },

  createBook(data: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'borrowedCopies' | 'availableCopies'> & { initialCopies?: number }): Book {
    const db = loadDatabase();
    const total = Number(data.totalCopies) || Number(data.initialCopies) || 1;
    const now = new Date().toISOString();

    // Check unique code or isbn
    const existingCode = db.books.find((b) => b.code.toUpperCase() === data.code.toUpperCase());
    if (existingCode) {
      throw new Error(`Kode buku ${data.code} sudah digunakan.`);
    }

    const newBook: Book = {
      id: `bk-${Date.now()}`,
      isbn: data.isbn.trim(),
      code: data.code.trim().toUpperCase(),
      title: data.title.trim(),
      author: data.author.trim(),
      publisher: data.publisher.trim(),
      publishYear: Number(data.publishYear) || new Date().getFullYear(),
      categoryId: data.categoryId,
      description: data.description?.trim() || '',
      shelfLocation: data.shelfLocation.trim(),
      coverImage: data.coverImage || '',
      totalCopies: total,
      availableCopies: total,
      borrowedCopies: 0,
      createdAt: now,
      updatedAt: now,
    };

    db.books.push(newBook);
    saveDatabase(db);
    return newBook;
  },

  updateBook(id: string, data: Partial<Book>): Book {
    const db = loadDatabase();
    const index = db.books.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Buku tidak ditemukan');

    const current = db.books[index];
    const totalCopies = data.totalCopies !== undefined ? Number(data.totalCopies) : current.totalCopies;

    if (totalCopies < current.borrowedCopies) {
      throw new Error(`Total eksemplar (${totalCopies}) tidak boleh lebih kecil dari eksemplar yang sedang dipinjam (${current.borrowedCopies}).`);
    }

    const availableCopies = totalCopies - current.borrowedCopies;

    db.books[index] = {
      ...current,
      ...data,
      totalCopies,
      availableCopies,
      updatedAt: new Date().toISOString(),
    };

    saveDatabase(db);
    return db.books[index];
  },

  deleteBook(id: string): { success: boolean; message?: string } {
    const db = loadDatabase();
    const book = db.books.find((b) => b.id === id);
    if (!book) throw new Error('Buku tidak ditemukan');

    if (book.borrowedCopies > 0) {
      throw new Error(`Buku "${book.title}" tidak dapat dihapus karena ${book.borrowedCopies} eksemplar masih dalam status dipinjam.`);
    }

    // Check if loans reference this book
    const activeLoans = db.loans.filter(
      (l) => (l.status === 'ACTIVE' || l.status === 'PARTIAL' || l.status === 'OVERDUE') &&
             l.items.some((i) => i.bookId === id && i.status !== 'RETURNED')
    );

    if (activeLoans.length > 0) {
      throw new Error(`Buku tidak dapat dihapus karena terdapat transaksi peminjaman aktif.`);
    }

    db.books = db.books.filter((b) => b.id !== id);
    saveDatabase(db);
    return { success: true };
  },

  // MEMBERS
  getMembers(filters?: { search?: string; status?: 'ALL' | 'ACTIVE' | 'INACTIVE' }): (Member & { activeLoansCount: number })[] {
    const db = loadDatabase();
    const activeLoanMap = new Map<string, number>();

    db.loans.forEach((l) => {
      if (l.status === 'ACTIVE' || l.status === 'PARTIAL' || l.status === 'OVERDUE') {
        const unreturnedCount = l.items.filter((i) => i.status !== 'RETURNED').length;
        activeLoanMap.set(l.memberId, (activeLoanMap.get(l.memberId) || 0) + unreturnedCount);
      }
    });

    let members = db.members.map((m) => ({
      ...m,
      activeLoansCount: activeLoanMap.get(m.id) || 0,
    }));

    if (filters?.status && filters.status !== 'ALL') {
      members = members.filter((m) => m.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      members = members.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.memberNumber.toLowerCase().includes(q) ||
          m.department.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      );
    }

    return members.sort((a, b) => a.fullName.localeCompare(b.fullName));
  },

  getMemberById(id: string): (Member & { activeLoansCount: number; loans: Loan[] }) | null {
    const db = loadDatabase();
    const member = db.members.find((m) => m.id === id);
    if (!member) return null;

    const loans = db.loans
      .filter((l) => l.memberId === id)
      .map((l) => refreshLoanOverdueStatus(l, db.settings.fineRatePerDay, db.settings.isFineEnabled))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const activeLoansCount = loans
      .filter((l) => l.status === 'ACTIVE' || l.status === 'PARTIAL' || l.status === 'OVERDUE')
      .reduce((sum, l) => sum + l.items.filter((i) => i.status !== 'RETURNED').length, 0);

    return {
      ...member,
      activeLoansCount,
      loans,
    };
  },

  createMember(data: Omit<Member, 'id' | 'createdAt' | 'joinedDate'>): Member {
    const db = loadDatabase();
    const existingNum = db.members.find((m) => m.memberNumber.toUpperCase() === data.memberNumber.toUpperCase());
    if (existingNum) {
      throw new Error(`Nomor anggota ${data.memberNumber} sudah terdaftar.`);
    }

    const now = new Date().toISOString();
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      memberNumber: data.memberNumber.trim().toUpperCase(),
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      department: data.department.trim(),
      joinedDate: now.split('T')[0],
      status: data.status || 'ACTIVE',
      notes: data.notes?.trim() || '',
      createdAt: now,
    };

    db.members.push(newMember);
    saveDatabase(db);
    return newMember;
  },

  updateMember(id: string, data: Partial<Member>): Member {
    const db = loadDatabase();
    const index = db.members.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Anggota tidak ditemukan');

    if (data.memberNumber) {
      const existing = db.members.find((m) => m.memberNumber.toUpperCase() === data.memberNumber!.toUpperCase() && m.id !== id);
      if (existing) throw new Error(`Nomor anggota ${data.memberNumber} sudah terdaftar.`);
    }

    db.members[index] = {
      ...db.members[index],
      ...data,
      fullName: data.fullName ? data.fullName.trim() : db.members[index].fullName,
      email: data.email ? data.email.trim() : db.members[index].email,
      phone: data.phone ? data.phone.trim() : db.members[index].phone,
    };

    saveDatabase(db);
    return db.members[index];
  },

  deleteMember(id: string): { success: boolean } {
    const db = loadDatabase();
    const member = db.members.find((m) => m.id === id);
    if (!member) throw new Error('Anggota tidak ditemukan');

    const activeLoans = db.loans.filter(
      (l) => l.memberId === id && (l.status === 'ACTIVE' || l.status === 'PARTIAL' || l.status === 'OVERDUE')
    );
    if (activeLoans.length > 0) {
      throw new Error(`Anggota ${member.fullName} memiliki pinjaman yang belum selesai. Nonaktifkan status anggota jika tidak aktif.`);
    }

    db.members = db.members.filter((m) => m.id !== id);
    saveDatabase(db);
    return { success: true };
  },

  // LOANS & RETURNS
  getLoans(filters?: { status?: string; search?: string; memberId?: string; staff?: string; dateFrom?: string; dateTo?: string }): Loan[] {
    const db = loadDatabase();
    let loans = db.loans.map((l) => refreshLoanOverdueStatus(l, db.settings.fineRatePerDay, db.settings.isFineEnabled));

    if (filters?.status && filters.status !== 'ALL') {
      loans = loans.filter((l) => l.status === filters.status);
    }

    if (filters?.memberId) {
      loans = loans.filter((l) => l.memberId === filters.memberId);
    }

    if (filters?.staff) {
      loans = loans.filter((l) => l.processedBy.toLowerCase().includes(filters.staff!.toLowerCase()));
    }

    if (filters?.dateFrom) {
      loans = loans.filter((l) => l.loanDate >= filters.dateFrom!);
    }

    if (filters?.dateTo) {
      loans = loans.filter((l) => l.loanDate <= filters.dateTo!);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      loans = loans.filter(
        (l) =>
          l.transactionCode.toLowerCase().includes(q) ||
          l.memberName.toLowerCase().includes(q) ||
          l.memberNumber.toLowerCase().includes(q) ||
          l.items.some((i) => i.bookTitle.toLowerCase().includes(q) || i.bookCode.toLowerCase().includes(q))
      );
    }

    return loans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getLoanById(id: string): Loan | null {
    const db = loadDatabase();
    const loan = db.loans.find((l) => l.id === id || l.transactionCode.toUpperCase() === id.toUpperCase());
    if (!loan) return null;
    return refreshLoanOverdueStatus(loan, db.settings.fineRatePerDay, db.settings.isFineEnabled);
  },

  getOverdueLoans(): Loan[] {
    const allLoans = this.getLoans();
    return allLoans.filter((l) => l.status === 'OVERDUE');
  },

  createLoan(data: {
    memberId: string;
    bookIds: string[];
    loanDate?: string;
    dueDate?: string;
    processedBy?: string;
    staffId?: string;
    notes?: string;
  }): Loan {
    const db = loadDatabase();

    // 1. Validate Member
    const member = db.members.find((m) => m.id === data.memberId);
    if (!member) throw new Error('Data anggota tidak ditemukan.');
    if (member.status !== 'ACTIVE') {
      throw new Error(`Anggota "${member.fullName}" berstatus ${member.status}. Peminjaman hanya diperbolehkan untuk anggota aktif.`);
    }

    // Check member's active borrowed books count
    const activeLoans = db.loans.filter(
      (l) => l.memberId === member.id && (l.status === 'ACTIVE' || l.status === 'PARTIAL' || l.status === 'OVERDUE')
    );
    const currentlyHoldingCount = activeLoans.reduce(
      (sum, l) => sum + l.items.filter((i) => i.status !== 'RETURNED').length,
      0
    );

    const maxAllowed = db.settings.maxBooksPerMember || 3;
    if (currentlyHoldingCount + data.bookIds.length > maxAllowed) {
      throw new Error(
        `Batas peminjaman terlampaui. Anggota sedang meminjam ${currentlyHoldingCount} buku. Batas maksimal per anggota adalah ${maxAllowed} buku.`
      );
    }

    if (data.bookIds.length === 0) {
      throw new Error('Pilih minimal satu buku untuk dipinjam.');
    }

    // 2. Validate Books & Stock
    const booksToBorrow: Book[] = [];
    for (const bookId of data.bookIds) {
      const book = db.books.find((b) => b.id === bookId);
      if (!book) throw new Error(`Buku dengan ID ${bookId} tidak ditemukan.`);
      if (book.availableCopies <= 0) {
        throw new Error(`Buku "${book.title}" sedang habis / tidak tersedia.`);
      }
      booksToBorrow.push(book);
    }

    // Check duplicate book in same loan request
    const uniqueBookIds = new Set(data.bookIds);
    if (uniqueBookIds.size !== data.bookIds.length) {
      throw new Error('Satu transaksi tidak boleh meminjam judul buku yang sama lebih dari satu kali.');
    }

    // 3. Calculate Dates
    const todayStr = data.loanDate || new Date().toISOString().split('T')[0];
    let calculatedDueDate = data.dueDate;
    if (!calculatedDueDate) {
      const d = new Date(todayStr);
      d.setDate(d.getDate() + (db.settings.defaultLoanDurationDays || 7));
      calculatedDueDate = d.toISOString().split('T')[0];
    }

    // 4. Atomic Stock Reduction
    booksToBorrow.forEach((book) => {
      book.availableCopies -= 1;
      book.borrowedCopies += 1;
      book.updatedAt = new Date().toISOString();
    });

    // 5. Generate Transaction Code
    const dateCode = todayStr.replace(/-/g, '').slice(0, 6);
    const countThisMonth = db.loans.filter((l) => l.transactionCode.includes(`TRX-${dateCode}`)).length + 1;
    const transactionCode = `TRX-${dateCode}-${String(countThisMonth).padStart(3, '0')}`;

    const loanId = `trx-${Date.now()}`;
    const loanItems: LoanItem[] = booksToBorrow.map((book, idx) => ({
      id: `item-${Date.now()}-${idx + 1}`,
      loanId,
      bookId: book.id,
      bookTitle: book.title,
      bookCode: book.code,
      isbn: book.isbn,
      status: 'BORROWED',
      returnedAt: null,
      fineAmount: 0,
    }));

    const newLoan: Loan = {
      id: loanId,
      transactionCode,
      memberId: member.id,
      memberName: member.fullName,
      memberNumber: member.memberNumber,
      memberDepartment: member.department,
      loanDate: todayStr,
      dueDate: calculatedDueDate,
      actualReturnDate: null,
      processedBy: data.processedBy || 'Petugas Perpustakaan',
      staffId: data.staffId,
      status: 'ACTIVE',
      totalFine: 0,
      finePaid: false,
      notes: data.notes?.trim() || '',
      items: loanItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.loans.push(newLoan);
    saveDatabase(db);
    return newLoan;
  },

  returnLoanItems(data: {
    loanId: string;
    itemIdsToReturn: string[];
    returnDate?: string;
    finePaid?: boolean;
    notes?: string;
  }): Loan {
    const db = loadDatabase();
    const loanIndex = db.loans.findIndex((l) => l.id === data.loanId || l.transactionCode.toUpperCase() === data.loanId.toUpperCase());
    if (loanIndex === -1) throw new Error('Transaksi peminjaman tidak ditemukan.');

    const loan = db.loans[loanIndex];
    const returnDateStr = data.returnDate || new Date().toISOString().split('T')[0];

    const isLate = returnDateStr > loan.dueDate;
    let daysLate = 0;
    if (isLate) {
      const d1 = new Date(loan.dueDate).getTime();
      const d2 = new Date(returnDateStr).getTime();
      daysLate = Math.max(0, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
    }

    const finePerItem = (isLate && db.settings.isFineEnabled) ? daysLate * db.settings.fineRatePerDay : 0;

    let totalReturnedNow = 0;

    loan.items = loan.items.map((item) => {
      if (data.itemIdsToReturn.includes(item.id)) {
        if (item.status === 'RETURNED') {
          return item; // already returned
        }

        totalReturnedNow += 1;

        // Restore book stock
        const book = db.books.find((b) => b.id === item.bookId);
        if (book) {
          book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
          book.borrowedCopies = Math.max(0, book.borrowedCopies - 1);
          book.updatedAt = new Date().toISOString();
        }

        return {
          ...item,
          status: 'RETURNED' as const,
          returnedAt: returnDateStr,
          fineAmount: finePerItem,
          notes: isLate ? `Terlambat ${daysLate} hari (Denda Rp ${finePerItem.toLocaleString('id-ID')})` : 'Tepat waktu',
        };
      }
      return item;
    });

    if (totalReturnedNow === 0) {
      throw new Error('Tidak ada buku yang dipilih atau semua buku sudah dikembalikan sebelumnya.');
    }

    // Check overall loan status
    const remainingBorrowed = loan.items.filter((i) => i.status !== 'RETURNED');
    if (remainingBorrowed.length === 0) {
      loan.status = 'RETURNED';
      loan.actualReturnDate = returnDateStr;
    } else {
      loan.status = 'PARTIAL';
    }

    // Calculate total fine for all items
    loan.totalFine = loan.items.reduce((acc, i) => acc + (i.fineAmount || 0), 0);
    if (data.finePaid !== undefined) {
      loan.finePaid = data.finePaid;
    }

    if (data.notes) {
      loan.notes = (loan.notes ? loan.notes + ' | ' : '') + data.notes;
    }

    loan.updatedAt = new Date().toISOString();
    db.loans[loanIndex] = loan;
    saveDatabase(db);

    return refreshLoanOverdueStatus(loan, db.settings.fineRatePerDay, db.settings.isFineEnabled);
  },

  settleLoanFine(loanId: string): Loan {
    const db = loadDatabase();
    const loan = db.loans.find((l) => l.id === loanId);
    if (!loan) throw new Error('Transaksi tidak ditemukan.');
    loan.finePaid = true;
    loan.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return refreshLoanOverdueStatus(loan, db.settings.fineRatePerDay, db.settings.isFineEnabled);
  },

  // DASHBOARD STATS
  getDashboardStats(): DashboardStats {
    const db = loadDatabase();
    const books = db.books;
    const members = db.members;
    const settings = db.settings;

    const loans = db.loans.map((l) => refreshLoanOverdueStatus(l, settings.fineRatePerDay, settings.isFineEnabled));

    const totalCopies = books.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
    const uniqueTitles = books.length;
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === 'ACTIVE').length;
    const currentlyBorrowed = books.reduce((sum, b) => sum + (b.borrowedCopies || 0), 0);
    const availableCopies = books.reduce((sum, b) => sum + (b.availableCopies || 0), 0);

    const overdueLoans = loans.filter((l) => l.status === 'OVERDUE');
    const overdueLoansCount = overdueLoans.length;

    // Recent activities (last 5 transactions)
    const recentActivities = [...loans]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 5);

    // Alerts
    const todayStr = new Date().toISOString().split('T')[0];
    const twoDaysAheadStr = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

    const dueSoon = loans.filter(
      (l) => (l.status === 'ACTIVE' || l.status === 'PARTIAL') && l.dueDate >= todayStr && l.dueDate <= twoDaysAheadStr
    );

    const lowStock = books.filter((b) => b.availableCopies <= 1);

    // Popular Books (rank by appearance in loan items)
    const bookLoanCounts = new Map<string, number>();
    loans.forEach((l) => {
      l.items.forEach((item) => {
        bookLoanCounts.set(item.bookId, (bookLoanCounts.get(item.bookId) || 0) + 1);
      });
    });

    const catMap = new Map(db.categories.map((c) => [c.id, c.name]));

    const popularBooks = [...books]
      .map((b) => ({
        bookId: b.id,
        title: b.title,
        author: b.author,
        categoryName: catMap.get(b.categoryId) || 'Umum',
        loanCount: bookLoanCounts.get(b.id) || 0,
        availableCopies: b.availableCopies,
        totalCopies: b.totalCopies,
      }))
      .sort((a, b) => b.loanCount - a.loanCount)
      .slice(0, 5);

    // Trend Data for chart (past 7 days activity)
    const days: string[] = [];
    const loanTrends: number[] = [];
    const returnTrends: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
      days.push(dayLabel);

      const loansOnDay = loans.filter((l) => l.loanDate === dStr).reduce((sum, l) => sum + l.items.length, 0);
      const returnsOnDay = loans
        .flatMap((l) => l.items)
        .filter((item) => item.status === 'RETURNED' && item.returnedAt === dStr).length;

      loanTrends.push(loansOnDay);
      returnTrends.push(returnsOnDay);
    }

    return {
      totalCopies,
      uniqueTitles,
      totalMembers,
      activeMembers,
      currentlyBorrowed,
      overdueLoansCount,
      availableCopies,
      recentActivities,
      popularBooks,
      alerts: {
        overdue: overdueLoans,
        dueSoon,
        lowStock,
      },
      trendData: {
        labels: days,
        loans: loanTrends,
        returns: returnTrends,
      },
    };
  },
};

