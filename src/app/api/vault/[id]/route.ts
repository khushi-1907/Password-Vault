import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VaultItem from '@/models/VaultItem';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const data = await req.json();
        const { name, username, password, url, notes, isFavorite } = data;

        await dbConnect();

        // Find current item to check if password changed
        const currentItem = await VaultItem.findOne({ _id: id, userId: user.userId });
        if (!currentItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const updateData: any = { name, username, url, notes, isFavorite };

        // If password changed, push old one to history
        if (password && password !== currentItem.password) {
            updateData.password = password;
            updateData.$push = { passwordHistory: currentItem.password };
        }

        const item = await VaultItem.findOneAndUpdate(
            { _id: id, userId: user.userId },
            updateData,
            { new: true }
        );

        return NextResponse.json({ message: 'Item updated', item }, { status: 200 });
    } catch (error: any) {
        console.error('Vault PUT error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();
        const item = await VaultItem.findOneAndDelete({ _id: id, userId: user.userId });

        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Item deleted' }, { status: 200 });
    } catch (error: any) {
        console.error('Vault DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
