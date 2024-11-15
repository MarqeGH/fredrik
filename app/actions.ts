'use server';

import { neon } from '@neondatabase/serverless';

export async function createComment(comment: string) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql(
      'INSERT INTO comments (text, username, created_at) VALUES ($1, $2, NOW())',
      [comment, 'anonymous']
    );
    return { success: true, data: comment };
  } catch (error) {
    console.error('Database error:', error);
    return { success: false, error: 'Failed to create comment' };
  }
} 