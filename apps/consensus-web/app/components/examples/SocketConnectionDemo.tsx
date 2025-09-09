'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useSocket } from '../../contexts/SocketContext';
import { Wifi, WifiOff, Activity, Users } from 'lucide-react';

export default function SocketConnectionDemo() {
  const { isConnected, socketId, joinClubs, leaveClubs } = useSocket();
  const [connectionHistory, setConnectionHistory] = useState<string[]>([]);
  const [testClubId] = useState('demo-club-123');

  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    const status = isConnected ? 'Connected' : 'Disconnected';
    setConnectionHistory(prev => [`${timestamp}: ${status}`, ...prev.slice(0, 9)]);
  }, [isConnected]);

  const handleJoinClub = () => {
    joinClubs([testClubId]);
    console.log('Joining club:', testClubId);
  };

  const handleLeaveClub = () => {
    leaveClubs([testClubId]);
    console.log('Leaving club:', testClubId);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold flex items-center">
          {isConnected ? (
            <Wifi className="h-5 w-5 mr-2 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 mr-2 text-red-600" />
          )}
          Socket Connection Status
        </h2>
        <p className="text-sm text-muted-foreground">
          Monitor real-time WebSocket connection status and activity.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <div className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Status:</span>
          </div>
          <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Connection Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted text-center">
            <Activity className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{isConnected ? 'Active' : 'Inactive'}</div>
            <div className="text-xs text-muted-foreground">Connection</div>
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <Wifi className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold text-xs font-mono">
              {socketId ? socketId.slice(0, 8) + '...' : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Socket ID</div>
          </div>
        </div>

        {/* Connection History */}
        <div>
          <h3 className="text-sm font-medium mb-2">Connection History</h3>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {connectionHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground">No connection events yet</p>
            ) : (
              connectionHistory.map((event, index) => (
                <div key={index} className="text-xs text-muted-foreground font-mono">
                  {event}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Test Actions */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Test Actions</h3>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleJoinClub}
              disabled={!isConnected}
            >
              Join Club
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleLeaveClub}
              disabled={!isConnected}
            >
              Leave Club
            </Button>
          </div>
        </div>

        {/* Status Alert */}
        {isConnected ? (
          <Alert variant="success">
            <div className="text-sm">
              <strong>Connected!</strong> You're receiving real-time updates.
            </div>
          </Alert>
        ) : (
          <Alert variant="error">
            <div className="text-sm">
              <strong>Disconnected!</strong> Real-time features are unavailable.
            </div>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Connection status updates automatically</p>
          <p>• Real-time features require active connection</p>
          <p>• Connection history shows recent events</p>
        </div>
      </CardContent>
    </Card>
  );
}
