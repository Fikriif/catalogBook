import { NextResponse } from 'next/server';
import { libraryService } from '@/lib/services/libraryService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'loans';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    const allLoans = libraryService.getLoans();
    const allBooks = libraryService.getBooks();
    const allMembers = libraryService.getMembers();
    const categories = libraryService.getCategories();
    const settings = libraryService.getSettings();

    // Filter loans by date if provided
    let filteredLoans = allLoans;
    if (dateFrom) {
      filteredLoans = filteredLoans.filter((l) => l.loanDate >= dateFrom);
    }
    if (dateTo) {
      filteredLoans = filteredLoans.filter((l) => l.loanDate <= dateTo);
    }

    if (type === 'loans') {
      const totalTransactions = filteredLoans.length;
      const totalBooksLoaned = filteredLoans.reduce((sum, l) => sum + l.items.length, 0);
      const activeLoans = filteredLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'PARTIAL').length;

      return NextResponse.json({
        success: true,
        summary: {
          totalTransactions,
          totalBooksLoaned,
          activeLoans,
        },
        data: filteredLoans,
      });
    }

    if (type === 'returns') {
      const returnedItems = allLoans.flatMap((l) =>
        l.items
          .filter((item) => item.status === 'RETURNED' && item.returnedAt)
          .map((item) => ({
            ...item,
            transactionCode: l.transactionCode,
            memberName: l.memberName,
            memberNumber: l.memberNumber,
            loanDate: l.loanDate,
            dueDate: l.dueDate,
          }))
      );

      let filteredReturns = returnedItems;
      if (dateFrom) {
        filteredReturns = filteredReturns.filter((r) => r.returnedAt! >= dateFrom);
      }
      if (dateTo) {
        filteredReturns = filteredReturns.filter((r) => r.returnedAt! <= dateTo);
      }

      const totalReturnedBooks = filteredReturns.length;
      const totalFinesCollected = filteredReturns.reduce((sum, r) => sum + (r.fineAmount || 0), 0);

      return NextResponse.json({
        success: true,
        summary: {
          totalReturnedBooks,
          totalFinesCollected,
        },
        data: filteredReturns,
      });
    }

    if (type === 'overdue') {
      const overdueLoans = allLoans.filter((l) => l.status === 'OVERDUE');
      const totalOverdueItems = overdueLoans.reduce(
        (sum, l) => sum + l.items.filter((i) => i.status !== 'RETURNED').length,
        0
      );
      const estimatedTotalFines = overdueLoans.reduce((sum, l) => sum + l.totalFine, 0);

      return NextResponse.json({
        success: true,
        summary: {
          totalOverdueTransactions: overdueLoans.length,
          totalOverdueItems,
          estimatedTotalFines,
        },
        data: overdueLoans,
      });
    }

    if (type === 'collection') {
      const totalTitles = allBooks.length;
      const totalCopies = allBooks.reduce((sum, b) => sum + b.totalCopies, 0);
      const availableCopies = allBooks.reduce((sum, b) => sum + b.availableCopies, 0);
      const borrowedCopies = allBooks.reduce((sum, b) => sum + b.borrowedCopies, 0);

      return NextResponse.json({
        success: true,
        summary: {
          totalTitles,
          totalCopies,
          availableCopies,
          borrowedCopies,
        },
        data: allBooks,
      });
    }

    if (type === 'members') {
      const totalMembers = allMembers.length;
      const activeMembers = allMembers.filter((m) => m.status === 'ACTIVE').length;
      const inactiveMembers = allMembers.filter((m) => m.status === 'INACTIVE').length;

      return NextResponse.json({
        success: true,
        summary: {
          totalMembers,
          activeMembers,
          inactiveMembers,
        },
        data: allMembers,
      });
    }

    if (type === 'fines') {
      const loansWithFines = allLoans.filter((l) => l.totalFine > 0);
      const totalFines = loansWithFines.reduce((sum, l) => sum + l.totalFine, 0);
      const totalPaid = loansWithFines.filter((l) => l.finePaid).reduce((sum, l) => sum + l.totalFine, 0);
      const totalUnpaid = totalFines - totalPaid;

      return NextResponse.json({
        success: true,
        summary: {
          totalFines,
          totalPaid,
          totalUnpaid,
        },
        data: loansWithFines,
      });
    }

    if (type === 'popular') {
      const stats = libraryService.getDashboardStats();
      return NextResponse.json({
        success: true,
        summary: {
          totalRanked: stats.popularBooks.length,
        },
        data: stats.popularBooks,
      });
    }

    return NextResponse.json({ success: false, error: 'Tipe laporan tidak valid' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

