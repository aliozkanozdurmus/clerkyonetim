import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import UserDashboard from '@/components/UserDashboard';

export default async function Home() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <main className="min-h-screen p-8">
      <UserDashboard />
    </main>
  );
} 