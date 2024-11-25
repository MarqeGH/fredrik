import React from 'react';

interface Message {
  text: string;
  username: string;
  id: string;
  liked: boolean;
}

interface MessageListProps {
  messages: Message[];
  onToggleLike: (messageId: string) => void;
}

export default function MessageList({ messages, onToggleLike }: MessageListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {messages.map((message, index) => (
        <div key={message.id || `message-${index}`} className="p-4 border rounded-lg shadow-sm bg-white">
          <p className="text-lg mb-2">{message.text}</p>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">By: {message.username}</p>
            <button
              onClick={() => onToggleLike(message.id)}
              className={`heart-button transition-transform hover:scale-110 ${message.liked ? 'liked' : ''}`}
            >
              {message.liked ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}