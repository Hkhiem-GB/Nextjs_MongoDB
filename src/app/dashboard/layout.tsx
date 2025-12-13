// src/app/dashboard/layout.tsx
import Link from 'next/link';
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {FaChartPie, FaUsers, FaSignOutAlt, FaUserCircle, FaCogs} from 'react-icons/fa';
import dbConnect from "../../../libs/mongodb";
import User from "../../../models/User";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    // 1. Lấy session để biết ai đang đăng nhập
    const session = await getServerSession(authOptions);

    // 2. Kết nối DB để lấy Tên chuẩn nhất từ MongoDB
    await dbConnect();
    const currentUser = await User.findOne({ email: session?.user?.email }).select('name image').lean();

    // 3. Ưu tiên lấy tên từ DB, nếu không có mới lấy từ session
    // Dòng này chính là câu trả lời cho việc "truyền tên người dùng vào"
    const userName = currentUser?.name || session?.user?.name || "Admin User";

    // Lấy ảnh (nếu có logic ảnh), không thì thôi
    const userImage = currentUser?.image as string | undefined;

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">

            {/* SIDEBAR */}
            <aside className="w-72 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-xl z-10 sticky top-0 h-screen">

                {/* --- PHẦN HEADER SIDEBAR (Đã chỉnh sửa theo ý bạn) --- */}
                <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                    {/* Avatar */}
                    {userImage ? (
                        <img src={userImage} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-green-500 shadow-sm" />
                    ) : (
                        <FaUserCircle className="w-12 h-12 text-gray-300" />
                    )}

                    {/* Tên người dùng (Đã bỏ Email và căn giữa) */}
                    <div className="flex flex-col justify-center">
               <span className="text-2xl font-bold text-gray-800 leading-tight">
                   {userName} {/* <-- Biến này chứa tên thật */}
               </span>
                    </div>
                </div>

                {/* --- MENU --- */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2">
                    <Link href="/dashboard" className="flex items-center gap-3 p-3 text-gray-700 font-bold rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 group">
                        <FaChartPie className="text-xl group-hover:scale-110 transition-transform" /> Dashboard
                    </Link>
                    <Link href="/dashboard/users" className="flex items-center gap-3 p-3 text-gray-700 font-bold rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 group">
                        <FaUsers className="text-xl group-hover:scale-110 transition-transform" /> Quản lý Users
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 text-gray-700 font-bold rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 group">
                        <FaCogs className="text-xl group-hover:scale-110 transition-transform" /> Cài đặt
                    </Link>
                </nav>

                {/* Footer Sidebar */}
                <div className="p-4 border-t border-gray-100">
                    <Link href="/api/auth/signout" className="flex items-center gap-3 p-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors">
                        <FaSignOutAlt /> Đăng xuất
                    </Link>
                </div>

            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto h-screen bg-slate-50 relative">
                {children}
            </main>
        </div>
    );
}