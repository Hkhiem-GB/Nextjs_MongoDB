import dbConnect from "../../../../../libs/mongodb";
import {NextResponse} from "next/server";
import User from "../../../../../models/User";
import bcrypt from "bcryptjs";
// Hàm lấy ID từ params (Next.js 15 update: params là Promise)
// Tuy nhiên để đơn giản cho Next 13/14, ta dùng cách standard:

// Định nghĩa params là Promise (Bắt buộc cho Next.js 15/16)
type Props = {
    params: Promise<{ id: string }>;
};

// --- API SỬA (UPDATE) ---
export async function PUT(request: Request, { params }: Props) {
    await dbConnect();
    try {
        // 🔥 QUAN TRỌNG: Phải await params thì mới lấy được ID
        const { id } = await params;

        const body = await request.json();

        //Xóa trường email khỏi dữ liệu cần update
        delete body.email;

        // Logic xử lý mật khẩu
        if (body.password) {
            body.password = await bcrypt.hash(body.password, 10);
        } else {
            delete body.password; // Nếu không nhập pass mới thì xóa đi
        }

        const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });

        if (!updatedUser) {
            return NextResponse.json({ success: false, message: "User không tồn tại" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedUser });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

// --- API XÓA (DELETE) ---
export async function DELETE(request: Request, { params }: Props) {
    await dbConnect();
    try {
        // 🔥 QUAN TRỌNG: Phải await params
        const { id } = await params;

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return NextResponse.json({ success: false, message: "User không tồn tại" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Đã xóa thành công" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}