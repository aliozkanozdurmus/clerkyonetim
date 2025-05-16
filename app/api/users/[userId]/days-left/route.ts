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

    const { daysLeft } = await request.json();
    
    if (typeof daysLeft !== 'number') {
      return new NextResponse('Invalid days left value', { status: 400 });
    }

    await (await clerkClient()).users.updateUser(params.userId, {
      publicMetadata: {
        daysLeft,
      },
    });

    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('Error updating days left:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 