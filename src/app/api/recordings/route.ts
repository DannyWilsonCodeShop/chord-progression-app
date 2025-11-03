import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import { uploadData } from 'aws-amplify/storage';
import type { Schema } from '@/../../amplify/data/resource';

const client = generateClient<Schema>();

// GET - Fetch user's recordings
export async function GET(request: NextRequest) {
  try {
    // Fetch all recordings for the authenticated user
    const { data: recordings, errors } = await client.models.Recording.list({
      limit: 100,
    });

    if (errors) {
      console.error('Error fetching recordings:', errors);
      return NextResponse.json({ error: 'Failed to fetch recordings' }, { status: 500 });
    }

    return NextResponse.json({ recordings: recordings || [] });
  } catch (error) {
    console.error('Error in GET /api/recordings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save new recording
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const fileName = formData.get('fileName') as string;
    const duration = parseInt(formData.get('duration') as string || '0');
    const progression = formData.get('progression') as string;
    const key = formData.get('key') as string;
    const userId = formData.get('userId') as string;

    if (!audioFile || !fileName || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique S3 key
    const timestamp = Date.now();
    const s3Key = `recordings/${userId}/${timestamp}-${fileName}`;

    // Upload to S3
    const uploadResult = await uploadData({
      key: s3Key,
      data: audioFile,
      options: {
        contentType: 'audio/webm',
      },
    }).result;

    // Save metadata to database
    const { data: recording, errors } = await client.models.Recording.create({
      userId,
      fileName,
      s3Key,
      duration,
      fileSize: audioFile.size,
      progression,
      key,
    });

    if (errors) {
      console.error('Error saving recording metadata:', errors);
      return NextResponse.json({ error: 'Failed to save recording' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      recording,
      s3Result: uploadResult,
    });
  } catch (error) {
    console.error('Error in POST /api/recordings:', error);
    return NextResponse.json({ error: 'Failed to save recording' }, { status: 500 });
  }
}

// DELETE - Delete a recording
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recordingId = searchParams.get('id');

    if (!recordingId) {
      return NextResponse.json({ error: 'Recording ID required' }, { status: 400 });
    }

    // Delete from database
    const { data, errors } = await client.models.Recording.delete({ id: recordingId });

    if (errors) {
      console.error('Error deleting recording:', errors);
      return NextResponse.json({ error: 'Failed to delete recording' }, { status: 500 });
    }

    // Note: S3 file deletion would happen here via storage.remove()
    // For now, we'll keep files in S3 for recovery purposes

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in DELETE /api/recordings:', error);
    return NextResponse.json({ error: 'Failed to delete recording' }, { status: 500 });
  }
}

