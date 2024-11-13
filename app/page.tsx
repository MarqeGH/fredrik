'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string, username: string }[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages([{ text: message, username: session?.user?.username || "Unknown" }, ...messages]);
      setMessage("");
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Welcome to the App! 🚀
      </h1>
      {session ? (
        <div>
          <h2 className="text-xl mb-4">Welcome, {session.user.name}!</h2>
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Sign out
          </button>
          <form onSubmit={handleSubmit} className="mb-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message"
              className="border p-2 rounded w-full mb-2"
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Submit
            </button>
          </form>
        </div>
      ) : (
        <div>
          <button
            onClick={() => signIn('twitter')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Sign in with Twitter
          </button>
        </div>
      )}
      <div className="flex flex-col items-center">
        {messages.map((msg, index) => (
          <div key={index} className="border p-4 rounded mb-2 w-1/2">
            <p>{msg.text}</p>
            <span className="text-sm text-gray-500">@{msg.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
