import { NextResponse } from 'next/server';
import { libraryService } from '@/lib/services/libraryService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    const stats = libraryService.getDashboardStats();

    if (range === '30d') {
      const labels: string[] = [];
      const loans: number[] = [];
      const returns: number[] = [];
      const allLoans = libraryService.getLoans();

      for (let i = 29; i >= 0; i -= 3) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));

        const loansCount = allLoans.filter((l) => l.loanDate <= dStr && l.loanDate >= new Date(d.getTime() - 3 * 86400000).toISOString().split('T')[0])
          .reduce((sum, l) => sum + l.items.length, 0);
        const returnsCount = allLoans.flatMap(l => l.items)
          .filter(it => it.returnedAt && it.returnedAt <= dStr && it.returnedAt >= new Date(d.getTime() - 3 * 86400000).toISOString().split('T')[0]).length;

        loans.push(loansCount);
        returns.push(returnsCount);
      }
      stats.trendData = { labels, loans, returns };
    } else if (range === '12m') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const labels: string[] = [];
      const loans: number[] = [];
      const returns: number[] = [];
      const allLoans = libraryService.getLoans();

      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        labels.push(`${monthNames[d.getMonth()]} ${y}`);

        const ymPrefix = `${y}-${m}`;
        const loanCount = allLoans.filter((l) => l.loanDate.startsWith(ymPrefix)).reduce((sum, l) => sum + l.items.length, 0);
        const returnCount = allLoans.flatMap((l) => l.items).filter((it) => it.returnedAt?.startsWith(ymPrefix)).length;

        loans.push(loanCount);
        returns.push(returnCount);
      }
      stats.trendData = { labels, loans, returns };
    }

    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

