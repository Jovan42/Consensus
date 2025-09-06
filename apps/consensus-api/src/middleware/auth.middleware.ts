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
  // Admin users (3 admins)
  'alexander.thompson@consensus.dev': {
    email: 'alexander.thompson@consensus.dev',
    name: 'Alexander Thompson',
    role: 'admin',
    sub: 'alex-admin',
    type: 'test' as const
  },
  'maya.patel@consensus.dev': {
    email: 'maya.patel@consensus.dev',
    name: 'Maya Patel',
    role: 'admin',
    sub: 'maya-admin',
    type: 'test' as const
  },
  'james.rodriguez@consensus.dev': {
    email: 'james.rodriguez@consensus.dev',
    name: 'James Rodriguez',
    role: 'admin',
    sub: 'james-admin',
    type: 'test' as const
  },
  
  // Regular members (6 members)
  'sophia.chen@consensus.dev': {
    email: 'sophia.chen@consensus.dev',
    name: 'Sophia Chen',
    role: 'member',
    sub: 'sophia-member',
    type: 'test' as const
  },
  'michael.johnson@consensus.dev': {
    email: 'michael.johnson@consensus.dev',
    name: 'Michael Johnson',
    role: 'member',
    sub: 'michael-member',
    type: 'test' as const
  },
  'emma.williams@consensus.dev': {
    email: 'emma.williams@consensus.dev',
    name: 'Emma Williams',
    role: 'member',
    sub: 'emma-member',
    type: 'test' as const
  },
  'oliver.brown@consensus.dev': {
    email: 'oliver.brown@consensus.dev',
    name: 'Oliver Brown',
    role: 'member',
    sub: 'oliver-member',
    type: 'test' as const
  },
  'ava.davis@consensus.dev': {
    email: 'ava.davis@consensus.dev',
    name: 'Ava Davis',
    role: 'member',
    sub: 'ava-member',
    type: 'test' as const
  },
  'liam.miller@consensus.dev': {
    email: 'liam.miller@consensus.dev',
    name: 'Liam Miller',
    role: 'member',
    sub: 'liam-member',
    type: 'test' as const
  },
  
  // Auth0 test account
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
