import { NextRequest, NextResponse } from 'next/server';
import { getMessages } from '../../actions';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || typeof token.username !== 'string') {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const session = { user: { username: token.username } };
    const messages = await getMessages(session);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}