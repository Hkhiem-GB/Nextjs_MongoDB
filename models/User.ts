import mongoose, { Schema, Model, Document } from 'mongoose';

// 1. Định nghĩa Interface cho User (TypeScript)
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    image?: string;
    createdAt: Date;
    role: string;
}

// 2. Tạo Schema
const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Vui lòng nhập email'],
            unique: true, // Email không được trùng
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Email không hợp lệ',
            ],
        },
        password: { type: String, select: false },
        image: {
            type: String,
        },
        role: { type: String, default: 'user' },
    },
    {
        timestamps: true, // Tự động thêm createdAt và updatedAt
    }
);

// 3. Tạo Model
// Tránh lỗi OverwriteModelError
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;