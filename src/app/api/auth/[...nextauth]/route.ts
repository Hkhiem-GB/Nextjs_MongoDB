import NextAuth, { AuthOptions } from "next-auth"; // Thêm AuthOptions để có gợi ý code
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from "../../../../../libs/mongodb";
import User  from "../../../../../models/User"
import bcrypt from "bcryptjs";

// 1. Tách cấu hình ra biến riêng và thêm chữ "export"
export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials): Promise<any> {
                await dbConnect();
                const user = await User.findOne({ email: credentials?.email }).select('+password');

                if (!user) throw new Error('Email không tồn tại');

                const isMatch = await bcrypt.compare(credentials!.password, user.password);

                if (!isMatch) throw new Error('Sai mật khẩu');

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                };
            }
        })
    ],
    callbacks: {
        // 1. Chuyền dữ liệu từ Login vào Token
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                // token.role = user.role;

                if (user.email === process.env.ADMIN_EMAIL) {
                    token.role = 'admin';
                } else {
                    token.role = user.role || 'user';
                }
            }
            return token;
        },
        // 2. Chuyền dữ liệu từ Token ra Session (để Client dùng)
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: { signIn: '/login' },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
};

// 2. Truyền biến authOptions vào hàm handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };