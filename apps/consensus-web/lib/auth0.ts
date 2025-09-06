// Hardcoded test accounts for development
export const TEST_ACCOUNTS = {
  'test1@consensus.dev': {
    sub: 'test-user-1',
    email: 'test1@consensus.dev',
    name: 'Test User 1',
    picture: 'https://via.placeholder.com/150',
    role: 'admin'
  },
  'test2@consensus.dev': {
    sub: 'test-user-2',
    email: 'test2@consensus.dev',
    name: 'Test User 2',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'test3@consensus.dev': {
    sub: 'test-user-3',
    email: 'test3@consensus.dev',
    name: 'Test User 3',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'admin@consensus.dev': {
    sub: 'admin-user',
    email: 'admin@consensus.dev',
    name: 'Admin User',
    picture: 'https://via.placeholder.com/150',
    role: 'admin'
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
