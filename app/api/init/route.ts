import { NextResponse } from 'next/server';
import { initDirectories } from '@/lib/server-utils';

export async function POST() {
  try {
    await initDirectories();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error initializing directories:', error);
    return NextResponse.json(
      { error: { message: 'Failed to initialize directories' } },
      { status: 500 }
    );
  }
}