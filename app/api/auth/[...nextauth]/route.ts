import NextAuth, { type NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { TwitterProfile } from "@/app/types/types";

declare module "next-auth" {
    interface Session {
        user: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            username?: string;
        };
    }
}

const authOptions: NextAuthOptions = {
    providers: [
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID as string,
            clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
            version: "2.0",
            authorization: {
                params: {
                    scope: "users.read tweet.read offline.access",
                }
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                // Detailed validation checks
                if (!account) {
                    console.error('Authentication failed: No account details received from Twitter');
                    return false;
                }
                
                if (!account.providerAccountId) {
                    console.error('Authentication failed: No provider account ID received');
                    return false;
                }

                if (!user.name) {
                    console.error('Authentication failed: No user name received');
                    return false;
                }

                if (!profile) {
                    console.error('Authentication failed: No profile data received from Twitter');
                    return false;
                }

                const username = (profile as TwitterProfile).data?.username;
                if (!username) {
                    console.error('Authentication failed: No username found in Twitter profile', profile);
                    return false;
                }

                console.log('Authentication successful:', { 
                    name: user.name, 
                    username, 
                    providerAccountId: account.providerAccountId,
                    accessToken: account.access_token ? 'Present' : 'Missing',
                    profile: JSON.stringify(profile, null, 2)
                });
                return true;
            } catch (error) {
                console.error('Critical error during sign-in:', {
                    error,
                    errorMessage: error instanceof Error ? error.message : 'Unknown error',
                    errorStack: error instanceof Error ? error.stack : undefined,
                    account: account ? 'Present' : 'Missing',
                    user: user ? 'Present' : 'Missing',
                    profile: profile ? 'Present' : 'Missing'
                });
                return false;
            
            }
        },
        async session({ session, token }) {
            if (session.user) {
                // Add username to the session user object
                session.user.username = token.username as string;
            }
            return session;
        },
        async jwt({ token, profile }) {
            if (profile) {
                const twitterProfile = profile as TwitterProfile;
                token.username = twitterProfile.data.username;
            }
            return token;
        }
    },
    debug: true,
};

// Wrap the NextAuth handler for the App Router
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };