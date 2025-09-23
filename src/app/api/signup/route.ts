import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { generateId } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { email, startupId, source, wouldPay, pricePoint } = await request.json();
    
    if (!email || !startupId) {
      return NextResponse.json(
        { error: 'Email and startupId are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Store signup data in MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('signups');
    
    const signupData = {
      id: generateId(),
      email,
      startupId,
      source: source || 'direct',
      wouldPay: Boolean(wouldPay),
      pricePoint: pricePoint ? Number(pricePoint) : undefined,
      createdAt: new Date(),
    };

    // Check if email already exists for this startup
    const existingSignup = await collection.findOne({
      email,
      startupId
    });

    if (existingSignup) {
      return NextResponse.json(
        { error: 'Email already signed up for this startup' },
        { status: 409 }
      );
    }

    await collection.insertOne(signupData);
    
    return NextResponse.json({ 
      success: true, 
      signupId: signupData.id 
    });
  } catch (error) {
    console.error('Error processing signup:', error);
    return NextResponse.json(
      { error: 'Failed to process signup' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');
    
    const { db } = await connectToDatabase();
    const collection = db.collection('signups');
    
    let query = {};
    if (startupId) {
      query = { startupId };
    }
    
    const signups = await collection.find(query).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ signups });
  } catch (error) {
    console.error('Error fetching signups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signups' },
      { status: 500 }
    );
  }
}
