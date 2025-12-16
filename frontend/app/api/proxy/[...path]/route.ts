import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, "DELETE");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, "PATCH");
}

async function handleRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  try {
    // Check if user is authenticated with NextAuth
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 });
    }

    // Await params as it's now a Promise in Next.js 15+
    const resolvedParams = await params;

    // Build the backend URL
    const path = resolvedParams.path.join("/");
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/${path}`;
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      // Pass user info to backend for authentication
      "X-User-Id": session.user.id,
      "X-User-Email": session.user.email || "",
    };

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: "include",
    };

    // Add body for POST, PUT, PATCH requests
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        const body = await request.json();
        requestOptions.body = JSON.stringify(body);
      } catch (e) {
        // No body or invalid JSON
      }
    }

    // Forward the request to the backend
    const response = await fetch(fullUrl, requestOptions);

    // Get response data
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Return the response
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
