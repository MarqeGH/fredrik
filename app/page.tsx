'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {session?.user?.name}! 👋
        </h1>
        <p className="mb-4">
          Your Twitter username is: @{session?.user?.username}
        </p>
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Welcome to the App! 🚀
      </h1>
      <Link href="/privacy">Go to Privacy</Link>
      <button
        onClick={() => signIn('twitter')}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Sign in with Twitter
      </button>
    </div>
  );
}
