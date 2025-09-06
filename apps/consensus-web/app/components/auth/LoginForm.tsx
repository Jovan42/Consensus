'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAllTestAccounts } from '@/lib/auth0';

const LoginForm: React.FC = () => {
  const { login, testLogin, isLoading } = useAuth();
  const [testEmail, setTestEmail] = useState('');
  const [isTestLoginLoading, setIsTestLoginLoading] = useState(false);
  const [testLoginError, setTestLoginError] = useState('');

  const testAccounts = getAllTestAccounts();

  const handleTestLogin = async (email: string) => {
    setIsTestLoginLoading(true);
    setTestLoginError('');
    
    try {
      const success = await testLogin(email);
      if (!success) {
        setTestLoginError('Test login failed. Please try again.');
      }
    } catch (error) {
      setTestLoginError('An error occurred during test login.');
    } finally {
      setIsTestLoginLoading(false);
    }
  };

  const handleCustomTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testEmail.trim()) {
      await handleTestLogin(testEmail.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Consensus
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your preferred sign-in method
          </p>
        </div>

        <div className="space-y-6">
          {/* OAuth Login */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Sign in with OAuth
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sign up or sign in with your Google account
            </p>
            <button
              onClick={login}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>
          </div>

          {/* Test Accounts */}
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-medium text-yellow-800 mb-4">
              Test Accounts (Development)
            </h3>
            <p className="text-sm text-yellow-700 mb-4">
              Use these pre-configured test accounts for development
            </p>
            
            <div className="space-y-2">
              {testAccounts.map((account) => (
                <button
                  key={account.sub}
                  onClick={() => handleTestLogin(account.email)}
                  disabled={isTestLoginLoading}
                  className="w-full flex justify-between items-center py-2 px-3 border border-yellow-300 rounded-md text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{account.name}</span>
                  <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                    {account.role}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Test Email */}
            <div className="mt-4 pt-4 border-t border-yellow-300">
              <form onSubmit={handleCustomTestLogin} className="space-y-2">
                <label htmlFor="test-email" className="block text-sm font-medium text-yellow-800">
                  Or enter test email:
                </label>
                <div className="flex space-x-2">
                  <input
                    id="test-email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@consensus.dev"
                    className="flex-1 px-3 py-2 border border-yellow-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <button
                    type="submit"
                    disabled={isTestLoginLoading || !testEmail.trim()}
                    className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTestLoginLoading ? '...' : 'Login'}
                  </button>
                </div>
              </form>
              
              {testLoginError && (
                <p className="mt-2 text-sm text-red-600">{testLoginError}</p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Test accounts: test1@consensus.dev, test2@consensus.dev, test3@consensus.dev, admin@consensus.dev
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
