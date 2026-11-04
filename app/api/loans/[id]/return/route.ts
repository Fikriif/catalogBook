import { NextResponse } from 'next/server';
import { libraryService } from '@/lib/services/libraryService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { itemIdsToReturn, returnDate, finePaid, notes } = body;

    if (!itemIdsToReturn || !Array.isArray(itemIdsToReturn) || itemIdsToReturn.length === 0) {
      return NextResponse.json({ success: false, error: 'Pilih minimal satu buku yang akan dikembalikan.' }, { status: 400 });
    }

    const updated = libraryService.returnLoanItems({
      loanId: id,
      itemIdsToReturn,
      returnDate,
      finePaid,
      notes,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

