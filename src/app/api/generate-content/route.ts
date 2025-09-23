import { NextRequest, NextResponse } from 'next/server';
import { generateLandingPageContent } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json();
    
    if (!idea || typeof idea !== 'string') {
      return NextResponse.json(
        { error: 'Idea is required' },
        { status: 400 }
      );
    }

    const content = await generateLandingPageContent(idea);
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
