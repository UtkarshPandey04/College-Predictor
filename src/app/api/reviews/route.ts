import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api';

const reviewSchema = z.object({
  collegeId: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(20, 'Review must be at least 20 characters'),
  pros: z.string().optional(),
  cons: z.string().optional(),
  batch: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = reviewSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const { collegeId, ...reviewData } = result.data;

    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) return errorResponse('College not found', 404);

    // Check for existing review
    const existing = await prisma.review.findFirst({
      where: { userId: user.userId, collegeId },
    });
    if (existing) return errorResponse('You have already reviewed this college');

    const review = await prisma.review.create({
      data: {
        ...reviewData,
        userId: user.userId,
        collegeId,
      },
      include: { user: { select: { name: true } } },
    });

    // Update college rating
    const allReviews = await prisma.review.findMany({ where: { collegeId } });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await prisma.college.update({
      where: { id: collegeId },
      data: { rating: Math.round(avg * 10) / 10 },
    });

    return successResponse({ review }, 201);
  } catch (error) {
    console.error('Review error:', error);
    return errorResponse('Internal server error', 500);
  }
}
