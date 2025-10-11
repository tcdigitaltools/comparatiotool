import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

async function handleRequest(request: NextRequest, { path }: { path: string[] }) {
  try {
    const apiPath = path.join('/');
    
    
    // The path already includes the full API path, so use it directly
    const backendUrl = `${BACKEND_URL}/${apiPath}`;
    
    console.log('Backend URL:', backendUrl);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers.Authorization = authHeader;
    }
    
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'DELETE') {
      body = await request.text();
    }
    
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
    });
    
    const data = await response.text();
    
    console.log('Backend response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: data.substring(0, 200) + (data.length > 200 ? '...' : '')
    });
    
    // Create response with CORS headers
    const nextResponse = new NextResponse(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
      },
    });
    
    return nextResponse;
    
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Proxy error', message: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
