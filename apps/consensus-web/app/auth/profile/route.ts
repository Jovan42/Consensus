import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get user information from headers (sent by our authenticated fetch)
    const userEmail = request.headers.get('x-user-email');
    const userName = request.headers.get('x-user-name');
    const userRole = request.headers.get('x-user-role');
    const userSub = request.headers.get('x-user-sub');
    const userType = request.headers.get('x-user-type');

    // If no user information is provided in headers, return 401
    if (!userEmail) {
      // This is expected behavior - the endpoint exists but requires authentication
      // Auth0 or other components might make requests here before authentication is set up
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authentication required',
          error: 'unauthorized'
        },
        { status: 401 }
      );
    }

    // Return user profile information
    const userProfile = {
      sub: userSub,
      email: userEmail,
      name: userName,
      role: userRole,
      type: userType,
      picture: userType === 'test' ? 'https://via.placeholder.com/150' : undefined,
      isTestAccount: userType === 'test'
    };

    return NextResponse.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('Error in profile route:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
