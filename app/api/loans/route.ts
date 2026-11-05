import { NextResponse } from 'next/server';
import { libraryService } from '@/lib/services/libraryService';
import { currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const memberId = searchParams.get('memberId') || undefined;
    const staff = searchParams.get('staff') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    const loans = libraryService.getLoans({ status, search, memberId, staff, dateFrom, dateTo });
    return NextResponse.json({ success: true, data: loans });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, bookIds, loanDate, dueDate, notes } = body;

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Pilih anggota peminjam.' }, { status: 400 });
    }
    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Pilih minimal satu buku.' }, { status: 400 });
    }

    let staffName = 'Petugas Perpustakaan';
    let staffId: string | undefined = undefined;
    try {
      const user = await currentUser();
      if (user) {
        staffName = user.fullName || user.firstName || user.username || 'Petugas Perpustakaan';
        staffId = user.id;
      }
    } catch {
    }

    const created = libraryService.createLoan({
      memberId,
      bookIds,
      loanDate,
      dueDate,
      processedBy: staffName,
      staffId,
      notes,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

