'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { createComment } from './actions';

export default function Home() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<{ text: string, username: string }[]>([]);

  async function create(formData: FormData) {
    const comment = formData.get('comment') as string;
    try {
      const result = await createComment(comment);
      console.log('Comment creation result:', result);
      setMessages(prev => [...prev, { text: comment, username: session?.user?.name || 'anonymous' }]);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  }

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
          <form action={create} className="mb-4 flex justify-center items-center gap-2 max-w-lg mx-auto">
            <input
              type="text"
              name="comment"
              placeholder="Write a message"
              className="border p-2 rounded w-96 text-black"
            />
            <button type="submit" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
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
      <div className="grid grid-cols-3 gap-4">
        {messages.map((msg, index) => (
          <div key={index} className="border p-4 rounded">
            <p className="break-words">{msg.text}</p>
            <a href={`https://twitter.com/${msg.username}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-sky-600">@{msg.username}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
