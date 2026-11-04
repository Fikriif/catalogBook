import { NextResponse } from 'next/server';
import { libraryService } from '@/lib/services/libraryService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as any) || undefined;

    const members = libraryService.getMembers({ search, status });
    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberNumber, fullName, email, phone, department, status, notes } = body;

    if (!memberNumber?.trim() || !fullName?.trim()) {
      return NextResponse.json({ success: false, error: 'Nomor anggota dan nama lengkap wajib diisi.' }, { status: 400 });
    }

    const created = libraryService.createMember({
      memberNumber,
      fullName,
      email: email || '',
      phone: phone || '',
      department: department || 'Umum',
      status: status || 'ACTIVE',
      notes: notes || '',
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

