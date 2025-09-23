import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Fetching landing pages...');
    
    const { db } = await connectToDatabase();
    
    // Check if database connection is available
    if (!db) {
      console.warn('Database not available, returning empty array');
      return NextResponse.json([]);
    }
    
    console.log('Connected to database');
    
    const collection = db.collection('generations');
    console.log('Accessing generations collection');
    
    // Get all generations, sorted by creation date (most recent first)
    const generations = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`Found ${generations.length} generations`);
    
    // Transform the data to match the StartupIdea interface
    const ideas = generations.map((gen) => ({
      id: gen.startupId as string,
      idea: gen.idea as string,
      timestamp: (gen.createdAt as Date).getTime(),
      source: gen.source as string,
      industry: gen.industry as string
    }));
    
    console.log('Transformed ideas:', ideas.length);
    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Error fetching landing pages:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return empty array instead of error to prevent UI breaking
    return NextResponse.json([]);
  }
}
