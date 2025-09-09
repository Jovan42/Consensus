'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useError } from '../../contexts/ErrorContext';
import { useApiWithErrorHandling } from '../../hooks/useApiWithErrorHandling';

export default function ErrorHandlingExample() {
  const { showError, showSuccess, showWarning, showInfo } = useError();
  const { get, post } = useApiWithErrorHandling();

  const handleTestErrors = () => {
    // Test different types of toasts
    showInfo('This is an info message', 'Information');
    setTimeout(() => showSuccess('Operation completed successfully!', 'Success'), 1000);
    setTimeout(() => showWarning('This is a warning message', 'Warning'), 2000);
    setTimeout(() => showError('This is an error message', 'Error'), 3000);
  };

  const handleTest403Error = async () => {
    // Test 403 error handling
    await get('/member-notes/round/non-existent-round', 'Member Notes');
  };

  const handleTest404Error = async () => {
    // Test 404 error handling
    await get('/clubs/non-existent-club', 'Club Data');
  };

  const handleTestNetworkError = async () => {
    // Test network error handling
    await get('http://localhost:9999/api/test', 'Network Test');
  };

  const handleTestSuccess = async () => {
    // Test success message
    await post('/test-success', { test: true }, 'Test API', true, 'Test completed successfully!');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold">Error Handling Example</h2>
        <p className="text-sm text-muted-foreground">
          Test different types of error messages and toast notifications.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleTestErrors} variant="outline">
            Test All Toast Types
          </Button>
          <Button onClick={handleTestSuccess} variant="outline">
            Test Success
          </Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">HTTP Error Tests:</h3>
          <div className="grid grid-cols-1 gap-2">
            <Button onClick={handleTest403Error} variant="destructive">
              Test 403 Error (Member Notes)
            </Button>
            <Button onClick={handleTest404Error} variant="destructive">
              Test 404 Error (Club Data)
            </Button>
            <Button onClick={handleTestNetworkError} variant="destructive">
              Test Network Error
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Toast messages will appear in the top-right corner</p>
          <p>• They will automatically disappear after a few seconds</p>
          <p>• You can click the X to dismiss them manually</p>
          <p>• Different error types have different durations</p>
        </div>
      </CardContent>
    </Card>
  );
}
