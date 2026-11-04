import { NextResponse } from 'next/server';
import { libraryService } from '@/lib/services/libraryService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const loan = libraryService.getLoanById(id);
    if (!loan) {
      return NextResponse.json({ success: false, error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: loan });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

