// Hardcoded test accounts for development
export const TEST_ACCOUNTS = {
  // Admin users
  'admin@consensus.dev': {
    sub: 'admin-user',
    email: 'admin@consensus.dev',
    name: 'Admin User',
    picture: 'https://via.placeholder.com/150',
    role: 'admin'
  },
  'test1@consensus.dev': {
    sub: 'test-user-1',
    email: 'test1@consensus.dev',
    name: 'Test User 1',
    picture: 'https://via.placeholder.com/150',
    role: 'admin'
  },
  
  // Regular members
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
  
  // Book club enthusiasts
  'alice@consensus.dev': {
    sub: 'alice-bookworm',
    email: 'alice@consensus.dev',
    name: 'Alice Johnson',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'bob@consensus.dev': {
    sub: 'bob-reader',
    email: 'bob@consensus.dev',
    name: 'Bob Smith',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'carol@consensus.dev': {
    sub: 'carol-librarian',
    email: 'carol@consensus.dev',
    name: 'Carol Davis',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  
  // Movie club members
  'david@consensus.dev': {
    sub: 'david-cinephile',
    email: 'david@consensus.dev',
    name: 'David Wilson',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'eve@consensus.dev': {
    sub: 'eve-filmcritic',
    email: 'eve@consensus.dev',
    name: 'Eve Brown',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'frank@consensus.dev': {
    sub: 'frank-director',
    email: 'frank@consensus.dev',
    name: 'Frank Miller',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  
  // Gaming club members
  'grace@consensus.dev': {
    sub: 'grace-gamer',
    email: 'grace@consensus.dev',
    name: 'Grace Lee',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'henry@consensus.dev': {
    sub: 'henry-strategist',
    email: 'henry@consensus.dev',
    name: 'Henry Taylor',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'iris@consensus.dev': {
    sub: 'iris-questmaster',
    email: 'iris@consensus.dev',
    name: 'Iris Chen',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  
  // Club managers (non-admin)
  'manager@consensus.dev': {
    sub: 'club-manager',
    email: 'manager@consensus.dev',
    name: 'Manager User',
    picture: 'https://via.placeholder.com/150',
    role: 'member'
  },
  'sarah@consensus.dev': {
    sub: 'sarah-organizer',
    email: 'sarah@consensus.dev',
    name: 'Sarah Martinez',
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
