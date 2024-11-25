'use server';

import { neon } from '@neondatabase/serverless';

export async function createComment(comment: string, twitterHandle: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    await sql`
      UPDATE users 
      SET twitter_handle = ${twitterHandle}
    `;
    
    const result = await sql`
      INSERT INTO comments (content, username, created_at) 
      VALUES (${comment}, ${twitterHandle}, NOW())
      RETURNING *
    `;
    
    return { 
      success: true, 
      data: {
        text: result[0].content,  // Map 'content' back to 'text' for frontend compatibility
        username: result[0].username
      }
    };
  } catch (error: unknown) {
    console.error('Database error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create comment' };
  }
} 

export async function getMessages(session: { user: { username: string } }) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const messages = await sql`
      SELECT c.id, c.content, c.username, 
      EXISTS (SELECT 1 FROM likes WHERE message_id = c.id AND user_id = ${session.user.username}) AS liked
      FROM comments c
      ORDER BY c.created_at DESC
    `;

    return messages.map(msg => ({
      id: msg.id,
      text: msg.content,
      username: msg.username,
      liked: msg.liked
    }));
  } catch (error: unknown) {
    console.error('Database error:', error);
    return [];
  }
} 