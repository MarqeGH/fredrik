'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { createComment, getMessages } from './actions';
import MessageList from './components/MessageList';

export default function Home() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<{ text: string, username: string }[]>([]);
  const commentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchMessages() {
      const fetchedMessages = await getMessages();
      setMessages(fetchedMessages);
    }
    fetchMessages();
  }, []);

  async function create(formData: FormData) {
    const comment = formData.get('comment') as string;
    if (!comment?.trim()) return;

    try {
      const twitterHandle = session?.user?.username;
      const twitterId = (session?.user as any)?.id || '';

      const result = await createComment(comment, twitterHandle || 'anonymous', twitterId);
      if (!result.success) {
        throw new Error(result.error);
      }
      setMessages(prev => [{ 
        text: result.data.text, 
        username: result.data.username
      }, ...prev]);

      // Clear the input field
      if (commentInputRef.current) {
        commentInputRef.current.value = '';
      }
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
          <h2 className="text-xl mb-4">Welcome, {session.user.username}!</h2>
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Sign out
          </button>
          <form onSubmit={(e) => { e.preventDefault(); create(new FormData(e.currentTarget)); }} className="mb-4 flex justify-center items-center gap-2 max-w-lg mx-auto">
            <input
              type="text"
              name="comment"
              placeholder="Write a message"
              className="border p-2 rounded w-96 text-black"
              ref={commentInputRef}
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
      <MessageList messages={messages} />
    </div>
  );
}
