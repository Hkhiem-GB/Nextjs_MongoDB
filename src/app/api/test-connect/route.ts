import { NextResponse } from 'next/server';

import dbConnect from "../../../../libs/mongodb";// Chú ý đường dẫn import cho đúng với dự án của bạn

export async function GET() {
    try {
        console.log('--- Đang thử kết nối MongoDB... ---');
        await dbConnect();
        console.log('--- Kết nối THÀNH CÔNG! ---');

        return NextResponse.json({ message: 'Kết nối MongoDB thành công!' });
    } catch (error:any) {
        console.error('--- LỖI KẾT NỐI: ---', error);
        return NextResponse.json({ message: 'Lỗi kết nối', error: error.message }, { status: 500 });
    }
}