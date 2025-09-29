import { NextRequest, NextResponse } from 'next/server';

interface UploadRequest {
  type: string;
  fileName: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (only images)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Generate random filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const randomCode = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const fileName = `${file.name.split('.')[0]}_${timestamp}_${randomCode}.${fileExtension}`;

    // Get N8N credentials and URL from environment
    const username = process.env.N8N_USERNAME;
    const password = process.env.N8N_PASSWORD;
    const uploadUrl = process.env.N8N_UPLOAD_URL;

    if (!username || !password || !uploadUrl) {
      console.error('Missing N8N configuration (username, password, or upload URL)');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create Basic Auth header
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');

    // Create form data for upload
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    // Try different body format based on the requirements
    const bodyData = {
      type: 'upload-file',
      fileName: fileName
    };
    
    // Append as separate fields
    uploadFormData.append('type', 'upload-file');
    uploadFormData.append('fileName', fileName);
    
    console.log('Body data:', bodyData);

    console.log('Uploading file:', fileName);
    console.log('Upload URL:', uploadUrl);
    console.log('File size:', file.size);
    console.log('File type:', file.type);

    // Try method 1: FormData (current approach)
    let response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`
      },
      body: uploadFormData
    });

    console.log('Method 1 - Response status:', response.status);
    console.log('Method 1 - Response headers:', Object.fromEntries(response.headers.entries()));
    
    // If first method fails, try method 2: JSON with base64
    if (response.status !== 200) {
      console.log('Method 1 failed, trying method 2 with JSON body...');
      
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64File = buffer.toString('base64');
      
      response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'upload-file',
          fileName: fileName,
          file: base64File,
          mimeType: file.type
        })
      });
      
      console.log('Method 2 - Response status:', response.status);
      console.log('Method 2 - Response headers:', Object.fromEntries(response.headers.entries()));
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload response error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to upload file to storage service' },
        { status: response.status }
      );
    }

    // Get response text first to handle potential JSON parsing issues
    const responseText = await response.text();
    console.log('Raw upload response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('Parsed upload response:', result);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      console.error('Response text was:', responseText);
      return NextResponse.json(
        { error: 'Upload service returned invalid response format' },
        { status: 500 }
      );
    }

    // Check if response contains image_url
    if (!result.image_url) {
      console.error('Response missing image_url:', result);
      return NextResponse.json(
        { error: 'Upload service did not return image URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      image_url: result.image_url,
      fileName: fileName
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error during file upload' },
      { status: 500 }
    );
  }
}