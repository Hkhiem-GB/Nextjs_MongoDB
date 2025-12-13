import {NextResponse} from "next/server";
import dbConnect from "../../../../libs/mongodb";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";
export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();
        await dbConnect();

        // 1. Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'Email này đã được đăng ký!' }, { status: 400 });
        }

        // 2. Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Tạo user mới
        await User.create({ name, email, password: hashedPassword });

        return NextResponse.json({ message: 'Đăng ký thành công!' }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Lỗi server', error: error.message }, { status: 500 });
    }
}