import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_OPTIONS } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, data: { message: 'Logged out' } });
  response.cookies.delete(COOKIE_OPTIONS.name);
  return response;
}
