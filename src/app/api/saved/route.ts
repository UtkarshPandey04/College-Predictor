import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const saved = await prisma.savedCollege.findMany({
    where: { userId: user.userId },
    include: {
      college: {
        include: {
          courses: { take: 3 },
          recruiters: { take: 3 },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({
    colleges: saved.map((s) => ({ ...s.college, isSaved: true, savedAt: s.createdAt })),
  });
}

const toggleSchema = z.object({ collegeId: z.string() });

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = toggleSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const { collegeId } = result.data;

    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) return errorResponse('College not found', 404);

    const existing = await prisma.savedCollege.findUnique({
      where: { userId_collegeId: { userId: user.userId, collegeId } },
    });

    if (existing) {
      await prisma.savedCollege.delete({
        where: { userId_collegeId: { userId: user.userId, collegeId } },
      });
      return successResponse({ saved: false, message: 'College removed from saved' });
    } else {
      await prisma.savedCollege.create({
        data: { userId: user.userId, collegeId },
      });
      return successResponse({ saved: true, message: 'College saved successfully' });
    }
  } catch (error) {
    console.error('Save toggle error:', error);
    return errorResponse('Internal server error', 500);
  }
}
