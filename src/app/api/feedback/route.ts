import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { generateId } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { startupId, feedback, rating, source } = await request.json();
    
    if (!startupId || !feedback || !rating) {
      return NextResponse.json(
        { error: 'startupId, feedback, and rating are required' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Store feedback in MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('feedback');
    
    const feedbackData = {
      id: generateId(),
      startupId,
      feedback: feedback.trim(),
      rating: Number(rating),
      source: source || 'direct',
      createdAt: new Date(),
    };

    await collection.insertOne(feedbackData);
    
    return NextResponse.json({ 
      success: true, 
      feedbackId: feedbackData.id 
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');
    
    const { db } = await connectToDatabase();
    const collection = db.collection('feedback');
    
    let query = {};
    if (startupId) {
      query = { startupId };
    }
    
    const feedback = await collection.find(query).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
