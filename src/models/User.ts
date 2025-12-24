import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
    },
}, {
    timestamps: true,
    collection: 'users',
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
