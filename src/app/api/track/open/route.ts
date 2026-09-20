import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// A transparent 1x1 GIF
const transparentGif = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const emailMessageId = searchParams.get('id');

  if (emailMessageId) {
    try {
      // Fire-and-forget update to the database
      // Using increment so multiple opens are tracked
      await db.emailMessage.update({
        where: { id: emailMessageId },
        data: {
          openedAt: new Date(),
          openCount: { increment: 1 },
        },
      });
    } catch (error) {
      console.error(`[Tracking] Failed to track open for ${emailMessageId}:`, error);
    }
  }

  // Always return the transparent 1x1 image, even if ID is missing or update fails
  return new NextResponse(transparentGif, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
