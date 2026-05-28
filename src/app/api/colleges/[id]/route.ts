import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);

    const college = await prisma.college.findUnique({
      where: { id: params.id },
      include: {
        courses: true,
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        placements: true,
        recruiters: { orderBy: { tier: 'asc' } },
      },
    });

    if (!college) return errorResponse('College not found', 404);

    let isSaved = false;
    if (user) {
      const saved = await prisma.savedCollege.findUnique({
        where: { userId_collegeId: { userId: user.userId, collegeId: params.id } },
      });
      isSaved = !!saved;
    }

    return successResponse({ college: { ...college, isSaved } });
  } catch (error) {
    console.error('College detail error:', error);
    return errorResponse('Internal server error', 500);
  }
}
