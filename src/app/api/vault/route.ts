import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VaultItem from '@/models/VaultItem';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const user = getAuthUser(req);
        if (!user || !user.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const items = await VaultItem.find({ userId: user.userId }).sort({ isFavorite: -1, name: 1 });

        return NextResponse.json({ items }, { status: 200 });
    } catch (error: any) {
        console.error('Vault GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = getAuthUser(req);
        if (!user || !user.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const { name, username, password, url, notes, isFavorite } = data;

        if (!name || !password) {
            return NextResponse.json({ error: 'Name and password are required' }, { status: 400 });
        }

        await dbConnect();
        const newItem = new VaultItem({
            name,
            username,
            password,
            url,
            notes,
            isFavorite: isFavorite || false,
            userId: user.userId,
        });

        await newItem.save();

        return NextResponse.json({ message: 'Item saved to vault', item: newItem }, { status: 201 });
    } catch (error: any) {
        console.error('Vault POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
