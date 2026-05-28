import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const state = searchParams.get('state') || '';
    const sort = searchParams.get('sort') || 'ranking';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const user = getUserFromRequest(request);

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
        { courses: { some: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }
    if (type) where.type = type;
    if (state) where.state = { contains: state, mode: 'insensitive' };

    const orderBy: Record<string, string> = {};
    switch (sort) {
      case 'rating': orderBy.rating = 'desc'; break;
      case 'fees_low': orderBy.feesPerYear = 'asc'; break;
      case 'fees_high': orderBy.feesPerYear = 'desc'; break;
      case 'placement': orderBy.placementRate = 'desc'; break;
      case 'package': orderBy.avgPackage = 'desc'; break;
      default: orderBy.ranking = 'asc';
    }

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          courses: { take: 5 },
          recruiters: { take: 4, orderBy: { tier: 'asc' } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.college.count({ where }),
    ]);

    // Get saved IDs for user
    let savedIds: string[] = [];
    if (user) {
      const saved = await prisma.savedCollege.findMany({
        where: { userId: user.userId },
        select: { collegeId: true },
      });
      savedIds = saved.map((s) => s.collegeId);
    }

    const enriched = colleges.map((c) => ({
      ...c,
      isSaved: savedIds.includes(c.id),
      reviewCount: c._count.reviews,
    }));

    return successResponse({
      colleges: enriched,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Colleges list error:', error);
    return errorResponse('Internal server error', 500);
  }
}
