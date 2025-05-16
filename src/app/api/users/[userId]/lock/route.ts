import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Lock the user
    await clerkClient.users.updateUser(userId, {
      locked: true,
    });

    // Revoke all sessions
    const sessions = await clerkClient.users.getSessions(userId);
    for (const session of sessions) {
      await clerkClient.sessions.revokeSession(session.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error locking user:', error);
    return NextResponse.json(
      { error: 'Failed to lock user' },
      { status: 500 }
    );
  }
} 