import { NextResponse } from 'next/server';
import { libraryService } from '@/lib/services/libraryService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const book = libraryService.getBookById(id);
    if (!book) {
      return NextResponse.json({ success: false, error: 'Buku tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: book });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = libraryService.updateBook(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    libraryService.deleteBook(id);
    return NextResponse.json({ success: true, message: 'Buku berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

