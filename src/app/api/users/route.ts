import { NextResponse } from 'next/server';
import dbConnect from "../../../../libs/mongodb";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET() {
    await dbConnect();
    try {
        // role: 1 (Tăng dần -> admin đứng trước user)
        // createdAt: -1 (Giảm dần -> Người mới tạo đứng trên)
        const users = await User.find({}).sort({ role: 1, createdAt: -1 });

        return NextResponse.json({ success: true, data: users });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// --- HÀM TẠO MỚI (POST) ---
export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();

        // Kiểm tra email trùng
        const exists = await User.findOne({ email: body.email });
        if (exists) {
            return NextResponse.json({ success: false, message: "Email đã tồn tại" }, { status: 400 });
        }

        // 👇 2. THÊM ĐOẠN NÀY: Mã hóa mật khẩu trước khi lưu
        if (body.password) {
            body.password = await bcrypt.hash(body.password, 10);
        }

        const user = await User.create(body);
        return NextResponse.json({ success: true, data: user }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}