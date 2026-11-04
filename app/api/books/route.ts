import { NextResponse } from 'next/server';
import { libraryService } from '@/lib/services/libraryService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const availability = (searchParams.get('availability') as any) || undefined;

    const books = libraryService.getBooks({ search, categoryId, availability });
    return NextResponse.json({ success: true, data: books });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { isbn, code, title, author, publisher, publishYear, categoryId, description, shelfLocation, totalCopies } = body;

    if (!title || !author || !categoryId || !shelfLocation) {
      return NextResponse.json({ success: false, error: 'Judul, penulis, kategori, dan lokasi rak wajib diisi.' }, { status: 400 });
    }

    const created = libraryService.createBook({
      isbn: isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      code: code || `BK-${Math.floor(100 + Math.random() * 900)}`,
      title,
      author,
      publisher: publisher || 'Penerbit Umum',
      publishYear: publishYear || new Date().getFullYear(),
      categoryId,
      description: description || '',
      shelfLocation,
      totalCopies: Number(totalCopies) || 1,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

