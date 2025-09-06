import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    name: string;
    role: string;
    sub: string;
    type: 'test' | 'auth0';
  };
}

// Hardcoded test accounts for development
const TEST_ACCOUNTS = {
  'test1@consensus.dev': {
    email: 'test1@consensus.dev',
    name: 'Test User 1',
    role: 'member',
    sub: 'test-user-1',
    type: 'test' as const
  },
  'test2@consensus.dev': {
    email: 'test2@consensus.dev',
    name: 'Test User 2',
    role: 'member',
    sub: 'test-user-2',
    type: 'test' as const
  },
  'test3@consensus.dev': {
    email: 'test3@consensus.dev',
    name: 'Test User 3',
    role: 'member',
    sub: 'test-user-3',
    type: 'test' as const
  },
  'admin@consensus.dev': {
    email: 'admin@consensus.dev',
    name: 'Admin User',
    role: 'admin',
    sub: 'admin-user',
    type: 'test' as const
  },
  'user@gmail.com': {
    email: 'user@gmail.com',
    name: 'Google User',
    role: 'member',
    sub: 'google-user-123',
    type: 'auth0' as const
  }
};

export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Extract user information from headers
    const userEmail = req.headers['x-user-email'] as string;
    const userName = req.headers['x-user-name'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const userSub = req.headers['x-user-sub'] as string;
    const userType = req.headers['x-user-type'] as string;

    // Require authentication headers for all API requests
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing user email header.'
      });
    }

    // Validate required fields
    if (!userName || !userRole || !userSub || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete user information in request headers'
      });
    }

    // For test accounts, validate against hardcoded list
    if (userType === 'test') {
      const testAccount = TEST_ACCOUNTS[userEmail as keyof typeof TEST_ACCOUNTS];
      if (!testAccount) {
        return res.status(401).json({
          success: false,
          message: 'Invalid test account'
        });
      }
      
      // Verify the provided information matches the test account
      if (testAccount.name !== userName || testAccount.role !== userRole || testAccount.sub !== userSub) {
        return res.status(401).json({
          success: false,
          message: 'Test account information mismatch'
        });
      }
    }

    // For Auth0 accounts, we'll trust the frontend for now
    // In production, you'd want to verify the JWT token
    if (userType === 'auth0') {
      // Basic validation - in production, verify JWT signature
      if (!userEmail.includes('@') || userRole !== 'member') {
        return res.status(401).json({
          success: false,
          message: 'Invalid Auth0 account information'
        });
      }
    }

    // Attach user information to request
    req.user = {
      email: userEmail,
      name: userName,
      role: userRole,
      sub: userSub,
      type: userType as 'test' | 'auth0'
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
