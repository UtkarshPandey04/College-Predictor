import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.getAll('ids');

    if (!ids.length || ids.length < 2 || ids.length > 3) {
      return errorResponse('Provide 2 or 3 college IDs via ?ids=...&ids=...');
    }

    const colleges = await prisma.college.findMany({
      where: { id: { in: ids } },
      include: {
        courses: true,
        placements: true,
        recruiters: { take: 6, orderBy: { tier: 'asc' } },
        _count: { select: { reviews: true } },
      },
    });

    if (colleges.length !== ids.length) {
      return errorResponse('One or more colleges not found', 404);
    }

    // Return in requested order
    const ordered = ids.map((id) => colleges.find((c) => c.id === id)!);
    return successResponse({ colleges: ordered });
  } catch (error) {
    console.error('Compare error:', error);
    return errorResponse('Internal server error', 500);
  }
}
