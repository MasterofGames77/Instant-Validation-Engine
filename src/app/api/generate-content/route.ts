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
      
      if (db) {
        const collection = db.collection('generations');
        
        // Check if this exact generation already exists to prevent duplicates
        const existingGeneration = await collection.findOne({
          startupId: startupId || 'unknown',
          idea: idea.trim(),
          source: source || 'direct'
        });
        
        if (!existingGeneration) {
          await collection.insertOne({
            startupId: startupId || 'unknown',
            idea: idea.trim(),
            source: source || 'direct',
            industry: content.industry! || 'unknown',
            createdAt: new Date(),
          });
        }
      } else {
        console.warn('Database not available, skipping generation storage');
      }
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
