import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { GridFSBucket } from 'mongodb';

export async function POST(request) {
  let uploadStream;
  try {
    const { client, db } = await connectToDatabase().catch(err => {
      throw new Error('Database connection failed: ' + err.message);
    });
    const formData = await request.formData();

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'desiredJobTitle', 'skills'];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create GridFS bucket
    const bucket = new GridFSBucket(db, {
      bucketName: 'resumes'
    });

    // Get and validate the file
    const file = formData.get('resume');
    if (!file || !file.type === 'application/pdf') {
      return NextResponse.json(
        { success: false, message: 'Valid PDF file is required' },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Upload file to GridFS with metadata
    uploadStream = bucket.openUploadStream(file.name, {
      contentType: file.type,
      metadata: {
        uploadDate: new Date(),
        email: formData.get('email'),
      }
    });

    await new Promise((resolve, reject) => {
      uploadStream.on('error', reject);
      uploadStream.on('finish', resolve);
      uploadStream.end(fileBuffer);
    });

    // Create document for form data
    const formDataDoc = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      desiredJobTitle: formData.get('desiredJobTitle'),
      skills: formData.get('skills').split(',').map(skill => skill.trim()),
      experienceLevel: formData.get('experienceLevel'),
      autoApply: formData.get('autoApply') === 'true',
      resumeId: uploadStream.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert form data with error handling
    const result = await db.collection('applications').insertOne(formDataDoc);
    
    if (!result.insertedId) {
      // If insert fails, cleanup the uploaded file
      await bucket.delete(uploadStream.id);
      throw new Error('Failed to save application data');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Application submitted successfully',
      applicationId: result.insertedId
    });

  } catch (error) {
    console.error('Error in resume upload:', error);
    
    // MongoDB connection specific error handling
    if (error.message.includes('Database connection failed')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Service temporarily unavailable. Please try again later.'
        },
        { status: 503 }
      );
    }
    
    // Cleanup uploaded file if it exists and there was an error
    if (uploadStream?.id) {
      try {
        const { db } = await connectToDatabase();
        const bucket = new GridFSBucket(db, { bucketName: 'resumes' });
        await bucket.delete(uploadStream.id);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to submit application'
      },
      { status: 500 }
    );
  }
}
