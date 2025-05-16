import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { isLocked } = await request.json();
    
    if (typeof isLocked !== 'boolean') {
      return new NextResponse('Invalid lock status', { status: 400 });
    }

    await (await clerkClient()).users.updateUser(params.userId, {
      publicMetadata: {
        isLocked,
      },
    });

    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('Error updating lock status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 