// src/app/dashboard/page.tsx
import { FaUserFriends, FaBookOpen, FaShieldAlt, FaChartLine } from 'react-icons/fa';

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-black text-4xl font-bold mb-6">Welcome to your admin dashboard</h1>

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