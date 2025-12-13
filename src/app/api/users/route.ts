import { NextResponse } from 'next/server';
import dbConnect from "../../../../libs/mongodb";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Tăng thời gian xử lý (giây)

// 1. Hàm GET: Lấy danh sách tất cả users
export async function GET() {
    await dbConnect();
    try {
        // Sắp xếp mới nhất lên đầu (sort createdAt -1)
        const users = await User.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: users });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// 2. Hàm POST: Tạo một user mới
export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();

        // Kiểm tra email trùng
        const exists = await User.findOne({ email: body.email });
        if (exists) {
            return NextResponse.json({ success: false, message: "Email đã tồn tại" }, { status: 400 });
        }

        const user = await User.create(body);
        return NextResponse.json({ success: true, data: user }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}