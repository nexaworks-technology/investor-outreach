import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const emailMessageId = searchParams.get('id');
  const url = searchParams.get('url');

  if (emailMessageId) {
    try {
      await db.emailMessage.update({
        where: { id: emailMessageId },
        data: {
          clickedAt: new Date(),
          openCount: { increment: 1 }, // A click counts as an open
        },
      });
    } catch (error) {
      console.error(`[Tracking] Failed to track click for ${emailMessageId}:`, error);
    }
  }

  if (url) {
    return NextResponse.redirect(url, 302);
  }

  // Fallback if no URL provided
  return NextResponse.redirect(new URL('/', request.url));
}
