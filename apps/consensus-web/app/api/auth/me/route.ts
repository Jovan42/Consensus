import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get user information from headers (sent by our authenticated fetch)
    const userEmail = request.headers.get('x-user-email');
    const userName = request.headers.get('x-user-name');
    const userRole = request.headers.get('x-user-role');
    const userSub = request.headers.get('x-user-sub');
    const userType = request.headers.get('x-user-type');

    // If no user information is provided, return 401
    if (!userEmail) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    // Return user profile information (Auth0 format)
    const userProfile = {
      sub: userSub,
      email: userEmail,
      name: userName,
      role: userRole,
      type: userType,
      picture: userType === 'test' ? 'https://via.placeholder.com/150' : undefined,
      isTestAccount: userType === 'test',
      // Auth0 standard fields
      email_verified: true,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('Error in /auth/me route:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
