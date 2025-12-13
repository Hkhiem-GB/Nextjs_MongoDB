'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCamera, FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';
import { useSession } from "next-auth/react";

// Định nghĩa kiểu dữ liệu User
interface User {
    _id: string;
    name: string;
    email: string;
    image?: string;
    role?: string;
    // Password không trả về từ API danh sách vì bảo mật
}

export default function UsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    // --- KIỂM TRA QUYỀN ADMIN ---
    // Bỏ qua lỗi TS nếu chưa định nghĩa role trong type
    const isAdmin = session?.user?.role === 'admin';

    // --- HÀM CHE EMAIL (...@gmail.com) ---
    const maskEmail = (email: string) => {
        if (!email) return "";
        const parts = email.split("@");
        if (parts.length < 2) return email;
        return `...@${parts[1]}`;
    };

    // --- STATE QUẢN LÝ MODAL & FORM ---
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', image: '', role: 'user' });
    const [showPassword, setShowPassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Load danh sách user khi trang vừa mở
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) setUsers(data.data);
        } catch (error) {
            toast.error('Lỗi tải dữ liệu');
        }
    };

    // 2. Xử lý Mở Modal Thêm mới
    const handleOpenAdd = () => {
        setIsEditMode(false);
        setFormData({ name: '', email: '', password: '', image: '', role: 'user' });
        setShowModal(true);
    };

    // 3. Xử lý Mở Modal Sửa
    const handleOpenEdit = (user: User) => {
        setIsEditMode(true);
        setCurrentUser(user);
        // Password để trống, chỉ nhập khi muốn đổi
        setFormData({ name: user.name, email: user.email, password: '', image: user.image || '', role: user.role || 'user' }); // Lấy role từ user, nếu không có thì mặc định là user
        setShowModal(true);
    };

    // 4. Xử lý Upload ảnh (Chuyển sang Base64)
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    // 5. Xử lý Submit (Thêm hoặc Sửa)
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEditMode ? `/api/users/${currentUser?._id}` : '/api/users';
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.success) {
                toast.success(isEditMode ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
                fetchUsers(); // Load lại bảng
                setShowModal(false); // Tắt modal
            } else {
                toast.error(data.message || data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            toast.error('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    // 6. Xử lý Mở Modal Xóa
    const handleOpenDelete = (user: User) => {
        setCurrentUser(user);
        setShowDeleteModal(true);
    };

    // 7. Xử lý Xóa thật (Khi bấm nút Xóa trong modal)
    const confirmDelete = async () => {
        if (!currentUser) return;
        try {
            const res = await fetch(`/api/users/${currentUser._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Đã xóa user thành công');
                setUsers(users.filter(u => u._id !== currentUser._id));
                setShowDeleteModal(false);
            } else {
                toast.error('Xóa thất bại');
            }
        } catch (error) {
            toast.error('Lỗi kết nối');
        }
    };

    return (
        <div className="bg-slate-50 min-h-full p-8 font-sans relative">
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

            {/* --- HEADER & NÚT THÊM MỚI --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-2xl font-bold text-gray-800">Quản Lý Users</h1>
                    <p className="text-gray-500 text-sm mt-1">Danh sách tất cả tài khoản trong hệ thống</p>
                </div>

                {/* CHỈ ADMIN MỚI THẤY NÚT THÊM */}
                {isAdmin && (
                    <button
                        onClick={handleOpenAdd}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                    >
                        <FaPlus /> Thêm User Mới
                    </button>
                )}
            </div>

            {/* --- BẢNG DỮ LIỆU --- */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider">User Info</th>
                            <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Email</th>

                            {/* CHỈ ADMIN MỚI THẤY CỘT PASSWORD & HÀNH ĐỘNG */}
                            {isAdmin && <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Mật khẩu</th>}
                            {isAdmin && <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-right">Hành động</th>}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300 shadow-sm flex-shrink-0">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg bg-gray-100">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-800 block">{user.name}</span>
                                        <span className="text-xs text-gray-500">{user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</span>
                                    </div>
                                </td>

                                {/* LOGIC HIỂN THỊ EMAIL */}
                                <td className="p-4 text-gray-600 font-medium">
                                    {isAdmin ? user.email : maskEmail(user.email)}
                                </td>

                                {/* LOGIC HIỂN THỊ PASSWORD */}
                                {isAdmin && (
                                    <td className="p-4 text-gray-400 select-none tracking-widest text-lg">••••••••</td>
                                )}

                                {/* LOGIC HIỂN THỊ NÚT SỬA/XÓA */}
                                {isAdmin && (
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenEdit(user)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300" title="Sửa thông tin">
                                                <FaEdit size={18} />
                                            </button>
                                            <button onClick={() => handleOpenDelete(user)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300" title="Xóa tài khoản">
                                                <FaTrash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={isAdmin ? 4 : 2} className="text-center py-10 text-gray-500">Chưa có người dùng nào.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL 1: THÊM / SỬA USER (Đã làm đẹp) --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    {/* Backdrop mờ và tối */}
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>

                    {/* Modal Content */}
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto z-10 overflow-hidden transform transition-all scale-100 relative">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-800">
                                {isEditMode ? 'Cập Nhật Thông Tin' : 'Thêm User Mới'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all focus:outline-none">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Modal Body - Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Upload Avatar (Đẹp hơn) */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 group hover:border-blue-400 cursor-pointer transition-all duration-300"
                                     onClick={() => fileInputRef.current?.click()}>
                                    {formData.image ? (
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-blue-500 transition-colors">
                                            <FaCamera size={32} className="mb-2" />
                                            <span className="text-xs font-medium uppercase tracking-wider">Tải ảnh lên</span>
                                        </div>
                                    )}
                                    {/* Overlay hiệu ứng khi hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-full"></div>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange}/>
                                <span className="text-xs text-gray-500 mt-3">Nhấn vào để thay đổi ảnh đại diện (Tùy chọn)</span>
                            </div>

                            {/* Tên */}
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 placeholder-gray-400"
                                       placeholder="Ví dụ: Nguyễn Văn A" />
                            </div>

                            {/* Email (Vô hiệu hóa khi sửa) */}
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Email {isEditMode ? <span className="text-gray-400 font-normal text-xs ml-1">(Không thể thay đổi)</span> : <span className="text-red-500">*</span>}
                                </label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                       disabled={isEditMode}
                                       className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400
                    ${isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed select-none' : 'bg-white text-gray-800'}`}
                                       placeholder="email@example.com" />
                            </div>

                            {/* --- THÊM PHẦN CHỌN ROLE (QUYỀN HẠN) --- */}
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700">Phân quyền thành viên</label>
                                <div className="relative">
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 appearance-none bg-white cursor-pointer"
                                    >
                                        <option value="user">Thành viên (User)</option>
                                        <option value="admin">Quản trị viên (Admin)</option>
                                    </select>
                                    {/* Mũi tên trỏ xuống trang trí cho đẹp */}
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    * Admin: Có toàn quyền quản lý hệ thống. User: Chỉ xem được nội dung.
                                </p>
                            </div>

                            {/* Mật khẩu (Có nút ẩn hiện) */}
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700">
                                    {isEditMode ? 'Mật khẩu mới (Bỏ trống nếu không đổi)' : <span>Mật khẩu <span className="text-red-500">*</span></span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required={!isEditMode} // Khi sửa thì không bắt buộc
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 pr-12 placeholder-gray-400"
                                        placeholder={isEditMode ? "••••••••" : "Nhập mật khẩu..."}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none flex items-center justify-center">
                                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Modal Footer Buttons */}
                            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowModal(false)}
                                        className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all active:scale-[0.98]">
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={loading}
                                        className={`flex-1 py-2.5 px-4 text-white font-semibold rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none transition-all shadow-md active:scale-[0.98] flex items-center justify-center
                     ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 hover:shadow-lg'}`}>
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang xử lý...
                                        </>
                                    ) : (isEditMode ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản')}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: XÁC NHẬN XÓA (Đã làm đẹp) --- */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowDeleteModal(false)}></div>

                    {/* Modal Content */}
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center z-10 relative transform transition-all scale-100">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce-slow">
                            <FaExclamationTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa tài khoản?</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            Hành động này sẽ xóa vĩnh viễn người dùng <span className="font-bold text-gray-800">"{currentUser?.name}"</span> khỏi hệ thống. Bạn không thể hoàn tác.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all active:scale-[0.98]">
                                Hủy bỏ
                            </button>
                            <button onClick={confirmDelete}
                                    className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
                                Vâng, Xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}