import NextAuth, { type NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { NextResponse } from "next/server";

// Debug logs for environment variables
console.log('TWITTER_CLIENT_ID:', process.env.TWITTER_CLIENT_ID?.slice(0, 5) + '...');
console.log('TWITTER_CLIENT_SECRET:', process.env.TWITTER_CLIENT_SECRET?.slice(0, 5) + '...');

const authOptions: NextAuthOptions = {
    providers: [
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID as string,
            clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
            version: "2.0"
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                if (!account?.providerAccountId || !user.name) {
                    console.error('Missing required user information');
                    return false;
                }

                const username = (profile as any).data.username;
                console.log('User signed in:', { name: user.name, username, providerAccountId: account.providerAccountId });
                return true;
            } catch (error) {
                console.error('Error in signIn callback:', error);
                return false;
            }
        },
        async session({ session, token }) {
            try {
                console.log('Session created:', { session, token });
                return session;
            } catch (error) {
                console.error('Error in session callback:', error);
                return session;
            }
        },
        async jwt({ token, account }) {
            if (account) {
                token.sub = account.providerAccountId;
            }
            console.log('JWT token created:', token);
            return token;
        },
    },
    debug: true,
};

// Wrap the NextAuth handler for the App Router
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };