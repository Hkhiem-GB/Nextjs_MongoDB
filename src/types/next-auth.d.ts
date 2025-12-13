// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    // Định nghĩa lại User trong session
    interface User {
        role?: string
    }

    interface Session {
        user: {
            role?: string
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string
    }
}