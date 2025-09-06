import { NextRequest, NextResponse } from 'next/server';

// Simple Auth0-like handlers for development
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'login';

  switch (action) {
    case 'login':
      // For now, redirect to a simple OAuth simulation
      return NextResponse.redirect('http://localhost:3000/api/auth/simulate-oauth');
    
    case 'logout':
      // Clear any session and redirect to home
      return NextResponse.redirect('http://localhost:3000');
    
    case 'callback':
      // Handle OAuth callback
      return NextResponse.redirect('http://localhost:3000/dashboard');
    
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}
