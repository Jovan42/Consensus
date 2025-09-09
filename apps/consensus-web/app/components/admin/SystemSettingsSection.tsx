'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Settings, Database, Server, Shield, Bell, Globe } from 'lucide-react';

export default function SystemSettingsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>System Settings</span>
        </CardTitle>
        <CardDescription>
          Configure system-wide settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <Database className="w-5 h-5 text-blue-500" />
              <h3 className="font-medium">Database</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Manage database connections and maintenance
            </p>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <Server className="w-5 h-5 text-green-500" />
              <h3 className="font-medium">Server Status</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Monitor server health and performance
            </p>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-5 h-5 text-red-500" />
              <h3 className="font-medium">Security</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Configure security policies and access controls
            </p>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <Bell className="w-5 h-5 text-yellow-500" />
              <h3 className="font-medium">Notifications</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Configure global notification settings
            </p>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <Globe className="w-5 h-5 text-purple-500" />
              <h3 className="font-medium">Localization</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Manage languages and regional settings
            </p>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <Settings className="w-5 h-5 text-gray-500" />
              <h3 className="font-medium">General</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              General system configuration options
            </p>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
