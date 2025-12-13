// src/app/dashboard/page.tsx
import { FaUserFriends, FaBookOpen, FaShieldAlt, FaChartLine } from 'react-icons/fa';
import {useSession} from "next-auth/react";
import User from "../../../models/User";
import dbConnect from "../../../libs/mongodb";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {getServerSession} from "next-auth";

export default async function DashboardPage() {

    // 1. Lấy thông tin người dùng hiện tại
    const session = await getServerSession(authOptions);

    // 2. Kết nối DB để lấy tên mới nhất (tránh trường hợp sửa tên xong chưa cập nhật)
    await dbConnect();
    const currentUser = await User.findOne({ email: session?.user?.email }).select('name').lean();

    // 3. Lấy tên ra (Ưu tiên tên trong DB -> Tên trong Session -> Mặc định)
    const userName = currentUser?.name || session?.user?.name || "User";

    return (
        <div className="p-4">
            <h1 className="text-black text-4xl font-bold mb-6">
                Welcome back, <span className="text-blue-600">{userName}</span>!
            </h1>

            <p className="text-gray-600 mb-8">
                Here is what&apos;s happening with your projects today.
            </p>

            {/* Grid thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-amber-400 text-lg">Total Users</p>
                            <h3 className="text-black text-2xl font-bold mt1">6</h3>
                        </div>
                        <FaUserFriends className="text-gray-800" />
                    </div>
                    <p className="text-green-500 text-xs mt-2 font-medium">+100% from last month</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-amber-400 text-lg">Active Courses</p>
                            <h3 className="text-black text-2xl font-bold mt-1">4</h3>
                        </div>
                        <FaBookOpen className="text-gray-800" />
                    </div>
                    <p className="text-green-500 text-xs mt-2 font-medium">+100% from last month</p>
                </div>

                {/* Bạn có thể thêm các ô khác tương tự */}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border h-64">
                    <h3 className=" text-black text-2xl font-semibold mb-4">Overview</h3>
                    {/* Chỗ này để biểu đồ sau này */}
                    <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
                </div>
            </div>
        </div>
    );
}