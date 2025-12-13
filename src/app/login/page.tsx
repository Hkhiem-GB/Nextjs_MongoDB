// src/app/login/page.tsx
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast, {Toaster} from 'react-hot-toast';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true); // Toggle giữa Login và Register
    const [data, setData] = useState({ name: '', email: '', password: '' });
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. BẮT ĐẦU: Bật loading lên ngay lập tức
        setLoading(true);

        if (isLogin) {
            // --- XỬ LÝ ĐĂNG NHẬP ---
            const res = await signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password
            });

            if (res?.error) {
                toast.error(res.error);
                setLoading(false); // ❌ Thất bại: Tắt loading để người dùng nhập lại
            }
            else {
                toast.success('Đăng nhập thành công!');
                router.push('/dashboard');
                // ✅ Thành công: KHÔNG tắt loading.
                // Để nó quay tiếp cho đến khi trang Dashboard hiện ra -> Tạo cảm giác mượt mà.
            }
        } else {
            // --- XỬ LÝ ĐĂNG KÝ ---
            try {
                // Lưu ý: Đảm bảo đường dẫn này đúng với file route bạn tạo
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await res.json();

                if (res.ok) {
                    toast.success('Đăng ký thành công! Hãy đăng nhập.');
                    setIsLogin(true); // Chuyển về form đăng nhập
                    setLoading(false); // ✅ Đăng ký xong: Tắt loading để người dùng thao tác tiếp
                } else {
                    toast.error(result.message);
                    setLoading(false); // ❌ Lỗi từ server (ví dụ trùng email): Tắt loading
                }
            } catch (err) {
                toast.error('Có lỗi xảy ra.');
                setLoading(false); // ❌ Lỗi mạng/code: Tắt loading
            }
        }
    };

    return (
        // Thêm text-black ở đây để ép chữ màu đen cho toàn bộ trang
        <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
            <Toaster position="top-center" />

            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                    {isLogin ? 'Login to your account' : 'Create an account'}
                </h2>
                <p className="text-gray-500 text-center mb-6 text-sm">
                    {isLogin ? 'Enter your email below to login' : 'Enter details to register'}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">Full Name</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
                                placeholder="Ex: John Doe"
                                onChange={e => setData({...data, name: e.target.value})}
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
                            placeholder="Email..."
                            onChange={e => setData({...data, email: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Password</label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
                            placeholder="••••••••"
                            onChange={e => setData({...data, password: e.target.value})}
                            required
                        />
                    </div>

                    <button type="submit" className="bg-green-600 text-white py-2 rounded-lg font-bold hover:opacity-80 transition mt-2">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-blue-500">OR CONTINUE WITH</span></div>
                </div>

                <div className="flex gap-4">
                    <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 text-neutral-600 font-medium bg-white transition-colors">
                        <FaGoogle className="text-rose-700 text-lg" /> Google
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 text-blue-600 font-medium bg-white">
                        <FaFacebook /> Facebook
                    </button>
                </div>

                <p className="text-center mt-6 text-sm text-gray-600">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="underline font-bold text-black hover:text-gray-700">
                        {isLogin ? 'Sign up' : 'Login'}
                    </button>
                </p>
            </div>

            {/* --- HIỆU ỨNG THANH TRƯỢT ĐỎ --- */}
            {loading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md transition-all duration-300">

                    {/* Hộp chứa thanh trượt */}
                    <div className="w-64 h-3 bg-gray-800/50 rounded-full relative overflow-hidden p-0.5 backdrop-blur-sm border border-white/10 shadow-xl">

                        {/* Thanh đỏ trượt bên trong */}
                        <div className="absolute top-0 left-0 h-full w-1/3 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-progress-slide shadow-[0_0_20px_rgba(220,38,38,0.8)]">
                            {/* Hiệu ứng phát sáng ở đầu thanh */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-400 rounded-full blur-[6px]"></div>
                        </div>

                    </div>

                    {/* Dòng chữ Loading bên dưới */}
                    <div className="mt-6 text-red-500 font-bold tracking-[0.2em] text-sm animate-pulse uppercase">
                        Đang xử lý...
                    </div>

                </div>
            )}

        </div>
    );
}