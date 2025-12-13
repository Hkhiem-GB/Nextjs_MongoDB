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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLogin) {
            // --- XỬ LÝ ĐĂNG NHẬP ---
            const res = await signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password
            });

            if (res?.error) toast.error(res.error);
            else {
                toast.success('Đăng nhập thành công!');
                router.push('/dashboard'); // Chuyển hướng vào Dashboard
            }
        } else {
            // --- XỬ LÝ ĐĂNG KÝ ---
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await res.json();

                if (res.ok) {
                    toast.success('Đăng ký thành công! Hãy đăng nhập.');
                    setIsLogin(true); // Chuyển về form đăng nhập
                } else {
                    toast.error(result.message);
                }
            } catch (err) {
                toast.error('Có lỗi xảy ra.');
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
        </div>
    );
}