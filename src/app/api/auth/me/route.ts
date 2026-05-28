import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) return unauthorizedResponse();

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) return unauthorizedResponse();
  return successResponse({ user });
}
