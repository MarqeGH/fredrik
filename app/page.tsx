'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { createComment, getMessages } from './actions';
import MessageList from './components/MessageList';

// Define the Message type
type Message = {
  id: string;
  text: string;
  username: string;
  liked: boolean;
};

// Define the expected type for the result data
type CommentData = {
  id: string;
  text: string;
  username: string;
  liked: boolean;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const commentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchMessages() {
      const sessionData = session ? { 
        user: { 
          username: session.user?.username || 'anonymous'
        }
      } : null;
      const fetchedMessages = await getMessages(sessionData);
      setMessages(fetchedMessages);
    }

    fetchMessages();
  }, [session]);

  async function create(formData: FormData) {
    const comment = formData.get('comment') as string;
    if (!comment?.trim()) return;

    try {
      const twitterHandle = session?.user?.username;

      const result: { 
        success: boolean; 
        data?: Partial<CommentData>;
        error?: string 
      } = await createComment(comment, twitterHandle || 'anonymous');
      
      if (!result.success || !result.data) {
        throw new Error(result.error);
      }

      // Ensure data includes all properties of CommentData
      const { 
        id = '', 
        text = '',  // Ensure text is a string
        username = '',  // Ensure username is a string
        liked = false 
      } = result.data;
      setMessages(prev => [{ 
        id,
        text, 
        username,
        liked
      }, ...prev]);

      // Clear the input field
      if (commentInputRef.current) {
        commentInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  }

  async function toggleLike(messageId: string) {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle like: ${response.statusText}`);
      }

      const updatedMessage = await response.json();
      
      // Update the messages state with the new like status
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === messageId 
            ? { 
                ...message, 
                liked: updatedMessage.liked 
              }
            : message
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
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
      <MessageList messages={messages} onToggleLike={toggleLike} />
    </div>
  );
}
