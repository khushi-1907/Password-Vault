import mongoose, { Schema } from 'mongoose';

const VaultItemSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
    },
    username: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Encrypted password is required'],
    },
    url: {
        type: String,
        trim: true,
    },
    notes: {
        type: String,
    },
    isFavorite: {
        type: Boolean,
        default: false,
    },
    passwordHistory: [{
        type: String, // Encrypted passwords
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
    collection: 'vault_items',
});

export default mongoose.models.VaultItem || mongoose.model('VaultItem', VaultItemSchema);
