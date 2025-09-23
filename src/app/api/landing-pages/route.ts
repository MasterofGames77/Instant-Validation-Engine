import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('generations');
    
    // Get all generations, sorted by creation date (most recent first)
    const generations = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Transform the data to match the StartupIdea interface
    const ideas = generations.map(gen => ({
      id: gen.startupId,
      idea: gen.idea,
      timestamp: gen.createdAt.getTime(),
      source: gen.source,
      industry: gen.industry
    }));
    
    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Error fetching landing pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing pages' },
      { status: 500 }
    );
  }
}
