// Hardcoded test accounts for development
export const TEST_ACCOUNTS = {
  // Admin users (3 admins)
  'alexander.thompson@consensus.dev': {
    sub: 'alex-admin',
    email: 'alexander.thompson@consensus.dev',
    name: 'Alexander Thompson',
    picture: 'https://via.placeholder.com/150',
    role: 'admin'
  },
  'maya.patel@consensus.dev': {
    sub: 'maya-admin',
    email: 'maya.patel@consensus.dev',
    name: 'Maya Patel',
    picture: 'https://via.placeholder.com/150',
    role: 'admin'
  },
  'james.rodriguez@consensus.dev': {
    sub: 'james-admin',
    email: 'james.rodriguez@consensus.dev',
    name: 'James Rodriguez',
    picture: 'https://via.placeholder.com/150',
    role: 'admin'
  },
  
  // Regular members (6 members)
  'sophia.chen@consensus.dev': {
    sub: 'sophia-member',
    email: 'sophia.chen@consensus.dev',
    name: 'Sophia Chen',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'michael.johnson@consensus.dev': {
    sub: 'michael-member',
    email: 'michael.johnson@consensus.dev',
    name: 'Michael Johnson',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'emma.williams@consensus.dev': {
    sub: 'emma-member',
    email: 'emma.williams@consensus.dev',
    name: 'Emma Williams',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'oliver.brown@consensus.dev': {
    sub: 'oliver-member',
    email: 'oliver.brown@consensus.dev',
    name: 'Oliver Brown',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'ava.davis@consensus.dev': {
    sub: 'ava-member',
    email: 'ava.davis@consensus.dev',
    name: 'Ava Davis',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'liam.miller@consensus.dev': {
    sub: 'liam-member',
    email: 'liam.miller@consensus.dev',
    name: 'Liam Miller',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  
  // Banned user for testing
  'banned@test.com': {
    sub: 'banned-user',
    email: 'banned@test.com',
    name: 'Banned User',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  }
};

// Helper function to check if email is a test account
export const isTestAccount = (email: string): boolean => {
  return email in TEST_ACCOUNTS;
};

// Helper function to get test account data
export const getTestAccount = (email: string) => {
  return TEST_ACCOUNTS[email as keyof typeof TEST_ACCOUNTS];
};

// Helper function to get all test accounts
export const getAllTestAccounts = () => {
  return Object.values(TEST_ACCOUNTS);
};
