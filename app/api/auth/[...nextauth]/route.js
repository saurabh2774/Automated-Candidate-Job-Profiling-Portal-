import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb"; 

export const authOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET
      }),
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET
      }),
    ],
    callbacks: {
      async signIn({ user, account, profile }) {
        try {
          const client = await clientPromise;
          const db = client.db("resumePortal"); 
          const usersCollection = db.collection("users");

          const existingUser = await usersCollection.findOne({ email: user.email });

          if (!existingUser) {
            
            await usersCollection.insertOne({
              email: user.email,
              name: user.name,
              image: user.image,
              type: null, 
              createdAt: new Date(),
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving user:", error);
          return false;
        }
      },
      async session({ session }) {
        try {
          const client = await clientPromise;
          const db = client.db("resumePortal");
          const existingUser = await db.collection("users").findOne({ email: session.user.email });
          
          if (existingUser) {
            
            session.user.type = existingUser.type; 
          }
        } catch (error) {
          console.error("Error fetching user session data:", error);
        }
        return session;
      }
    },
    session: { strategy: "jwt" }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };