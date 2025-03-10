import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { ConnectoDatabase } from "./db";
import User from "@/models/UserModel";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Please fill all fields");
                }

                try {
                    await ConnectoDatabase();

                    const user = await User.findOne({ email: credentials.email });

                    if (!user) {
                        throw new Error("No user found");
                    }

                    // Check if this is a social login user trying to use credentials
                    if (user.provider === 'google' || user.provider === 'github') {
                        throw new Error(`Please use ${user.provider.charAt(0).toUpperCase() + user.provider.slice(1)} Sign-In for this account`);
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordValid) {
                        throw new Error("Invalid password");
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: `${user.firstName} ${user.lastName}`,
                        image: user.profileImage,
                        provider: 'credentials'
                    };
                } catch (error) {
                    throw error;
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string
        })
    ],

    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.provider = account?.provider;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.provider = token.provider as string;
            }
            return session;
        },

        async signIn({ user, account }) {
            try {
                await ConnectoDatabase();
                const existingUser = await User.findOne({ email: user.email });

                // For OAuth Sign In (Google or GitHub)
                if (account?.provider === 'google' || account?.provider === 'github') {
                    if (existingUser) {
                        if (existingUser.provider === 'credentials') {
                            throw new Error("This email is already registered with password. Please use password to login.");
                        }

                        // Update existing OAuth user
                        await User.findByIdAndUpdate(existingUser._id, {
                            firstName: user.name?.split(" ")[0] || "",
                            lastName: user.name?.split(" ")[1] || "",
                            profileImage: user.image || "",
                            lastLogin: new Date()
                        });
                    } else {
                        // Create new OAuth user
                        const newUser = new User({
                            firstName: user.name?.split(" ")[0] || "",
                            lastName: user.name?.split(" ")[1] || "",
                            username: user.email?.split("@")[0],
                            email: user.email,
                            profileImage: user.image || "",
                            provider: account.provider,
                            isAdmin: false,
                            lastLogin: new Date()
                        });
                        await newUser.save();
                    }
                    return true;
                }

                // For Credentials Sign In
                if (account?.provider === 'credentials') {
                    if (!existingUser) {
                        throw new Error("No user found with this email");
                    }

                    if (existingUser.provider === 'google' || existingUser.provider === 'github') {
                        throw new Error(`This email is registered with ${existingUser.provider.charAt(0).toUpperCase() + existingUser.provider.slice(1)}. Please use ${existingUser.provider.charAt(0).toUpperCase() + existingUser.provider.slice(1)} Sign In.`);
                    }

                    // Update last login time
                    await User.findByIdAndUpdate(existingUser._id, {
                        lastLogin: new Date()
                    });

                    return true;
                }
                return false;
            } catch (error) {
                console.error("SignIn Error:", error);
                throw error;
            }
        }
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET
}