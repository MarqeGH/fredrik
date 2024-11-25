import { NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';


export async function POST(
  request: NextRequest,
  context: { params: { messageId: string } }
) {
  try {
    // Await the params object to safely access its properties
    const { params } = context;
    const messageId = (await params)?.messageId;

    const token = await getToken({ req: request });

    if (!token?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const twitterHandle = token.username;

    await sql`
      INSERT INTO users (twitter_handle, twitter_id)
      VALUES (${twitterHandle}, ${twitterHandle})
      ON CONFLICT (twitter_id) DO UPDATE 
      SET twitter_handle = ${twitterHandle}
      RETURNING twitter_handle
    `;

    const existingLike = await sql`
      SELECT * FROM likes 
      WHERE message_id = ${messageId} 
      AND user_id = ${twitterHandle}
    `;

    if (existingLike.length > 0) {
      await sql`
        DELETE FROM likes 
        WHERE message_id = ${messageId} 
        AND user_id = ${twitterHandle}
      `;
    } else {
      await sql`
        INSERT INTO likes (message_id, user_id) 
        VALUES (${messageId}, ${twitterHandle})
      `;
    }

    const updatedMessage = await sql`
      SELECT 
        c.id,
        c.content as text,
        c.username,
        EXISTS (
          SELECT 1 FROM likes 
          WHERE message_id = c.id 
          AND user_id = ${twitterHandle}
        ) AS liked
      FROM comments c
      WHERE c.id = ${messageId}
    `;

    return NextResponse.json(updatedMessage[0]);
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' }, 
      { status: 500 }
    );
  }
}
