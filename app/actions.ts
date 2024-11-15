'use server';

import { neon } from '@neondatabase/serverless';

export async function createComment(comment: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    const result = await sql`
      INSERT INTO comments (content, username, created_at) 
      VALUES (${comment}, ${'anonymous'}, NOW())
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