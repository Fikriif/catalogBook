export type BookCondition = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
export type BookCopyStatus = 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE' | 'LOST';

export interface BookCopy {
  id: string;
  bookId: string;
  barcode: string;
  status: BookCopyStatus;
  condition: BookCondition;
}

export interface Book {
  id: string;
  isbn: string;
  code: string;
  title: string;
  author: string;
  publisher: string;
  publishYear: number;
  categoryId: string;
  description: string;
  shelfLocation: string;
  coverImage?: string;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export type MemberStatus = 'ACTIVE' | 'INACTIVE';

export interface Member {
  id: string;
  memberNumber: string;
  fullName: string;
  email: string;
  phone: string;
  department: string; // Kelas atau Unit Kerja
  joinedDate: string;
  status: MemberStatus;
  notes?: string;
  createdAt: string;
}

export type LoanItemStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE';

export interface LoanItem {
  id: string;
  loanId: string;
  bookId: string;
  bookTitle: string;
  bookCode: string;
  isbn: string;
  status: LoanItemStatus;
  returnedAt?: string | null;
  fineAmount: number;
  notes?: string;
}

export type LoanStatus = 'ACTIVE' | 'PARTIAL' | 'RETURNED' | 'OVERDUE' | 'CANCELLED';

export interface Loan {
  id: string;
  transactionCode: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  memberDepartment?: string;
  loanDate: string; // YYYY-MM-DD
  dueDate: string;  // YYYY-MM-DD
  actualReturnDate?: string | null;
  processedBy: string; // Petugas
  staffId?: string;
  status: LoanStatus;
  totalFine: number;
  finePaid: boolean;
  notes?: string;
  items: LoanItem[];
  createdAt: string;
  updatedAt: string;
}

export interface LibrarySettings {
  libraryName: string;
  defaultLoanDurationDays: number;
  maxBooksPerMember: number;
  fineRatePerDay: number;
  isFineEnabled: boolean;
  address: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
}

export interface DashboardStats {
  totalCopies: number;
  uniqueTitles: number;
  totalMembers: number;
  activeMembers: number;
  currentlyBorrowed: number;
  overdueLoansCount: number;
  availableCopies: number;
  recentActivities: Loan[];
  popularBooks: {
    bookId: string;
    title: string;
    author: string;
    categoryName: string;
    loanCount: number;
    availableCopies: number;
    totalCopies: number;
  }[];
  alerts: {
    overdue: Loan[];
    dueSoon: Loan[];
    lowStock: Book[];
  };
  trendData: {
    labels: string[];
    loans: number[];
    returns: number[];
  };
}

