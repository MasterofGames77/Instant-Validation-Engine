import { NextRequest, NextResponse } from 'next/server';
import { generateLandingPageContent } from '@/lib/openai';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { idea, source, startupId } = await request.json();
    
    if (!idea || typeof idea !== 'string') {
      return NextResponse.json(
        { error: 'Idea is required' },
        { status: 400 }
      );
    }

    const content = await generateLandingPageContent(idea);
    
    // Store generation data in MongoDB for analytics
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection('generations');
      
      await collection.insertOne({
        startupId: startupId || 'unknown',
        idea,
        source: source || 'direct',
        industry: content.industry! || 'unknown', // We'll add this to the AI response
        createdAt: new Date(),
      });
    } catch (dbError) {
      console.error('Failed to store generation data:', dbError);
      // Don't fail the request if DB storage fails
    }
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
