'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Alert } from '@/app/components/ui/Alert';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { useTheme } from '@/app/contexts/ThemeContext';
import { getRoleColors, getStatusColors } from '@/lib/color-utils';
import ErrorHandlingExample from '@/app/components/examples/ErrorHandlingExample';
import { NotificationHandlerExample } from '@/app/components/examples/NotificationHandlerExample';
import SocketConnectionDemo from '@/app/components/examples/SocketConnectionDemo';
import FormValidationDemo from '@/app/components/examples/FormValidationDemo';
import { Tabs } from '@/app/components/ui/Tabs';
import Link from 'next/link';
import { 
  Palette, 
  AlertTriangle, 
  Bell, 
  Code, 
  Zap,
  ArrowLeft,
  Github,
  BookOpen,
  Wifi,
  FileText
} from 'lucide-react';

export default function DemoPage() {
  const { theme, resolvedTheme } = useTheme();
  const roles = ['admin', 'manager', 'member', 'test'];
  const statuses = ['success', 'error', 'warning', 'info'] as const;

  // Theme Demo Content
  const ThemeDemoContent = () => (
    <div className="space-y-6">
      {/* Theme Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground font-medium">Current Theme</p>
            <p className="text-muted-foreground">
              {theme} {theme === 'system' && `(${resolvedTheme})`}
            </p>
          </div>
          <ThemeToggle />
        </div>
        <Alert variant="info">
          Try switching between light, dark, and system themes to see the automatic color changes!
        </Alert>
      </div>

      {/* Color System Showcase */}
      <div className="space-y-6">
        {/* Button Variants */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-3">Button Variants</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </div>

        {/* Alert Variants */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-3">Alert Variants</h3>
          <div className="space-y-3">
            {statuses.map((status) => (
              <Alert key={status} variant={status}>
                This is a {status} alert message that adapts to the current theme.
              </Alert>
            ))}
          </div>
        </div>

        {/* Role Badges */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-3">Role-Based Colors</h3>
          <div className="flex flex-wrap gap-3">
            {roles.map((role) => {
              const colors = getRoleColors(role);
              return (
                <div
                  key={role}
                  className="px-3 py-2 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.text,
                  }}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Components Demo Content
  const ComponentsDemoContent = () => (
    <div className="space-y-6">
      {/* Semantic Colors Demo */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">Semantic Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Backgrounds</h4>
            <div className="space-y-2">
              <div className="h-12 rounded bg-background border border-border flex items-center px-4">
                <span className="text-foreground font-medium">background</span>
              </div>
              <div className="h-12 rounded bg-card border border-border flex items-center px-4">
                <span className="text-card-foreground font-medium">card</span>
              </div>
              <div className="h-12 rounded bg-muted flex items-center px-4">
                <span className="text-muted-foreground font-medium">muted</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Interactive Elements</h4>
            <div className="space-y-2">
              <div className="h-12 rounded bg-primary flex items-center px-4">
                <span className="text-primary-foreground font-medium">primary</span>
              </div>
              <div className="h-12 rounded bg-secondary flex items-center px-4">
                <span className="text-secondary-foreground font-medium">secondary</span>
              </div>
              <div className="h-12 rounded bg-destructive flex items-center px-4">
                <span className="text-destructive-foreground font-medium">destructive</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Button Sizes */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">Button Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      {/* Card Variants */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">Card Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <h4 className="font-medium">Default Card</h4>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is a standard card component with header and content.
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardHeader>
              <h4 className="font-medium text-primary">Highlighted Card</h4>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card has a primary border to highlight important content.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Documentation Content
  const DocumentationContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">System Documentation</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-medium text-sm">Theme System</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Complete guide to the color system and theme switching
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-medium text-sm">Error Handling</h4>
              <p className="text-xs text-muted-foreground mt-1">
                HTTP error handling with toast notifications
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-medium text-sm">Notification System</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time notifications and component handlers
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Development</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-medium text-sm">API Documentation</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Complete API endpoints and usage examples
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-medium text-sm">Database Schema</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Database structure and relationships
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-medium text-sm">Development Guide</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Setup instructions and development workflow
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    {
      id: 'theme',
      label: 'Theme System',
      icon: <Palette className="h-4 w-4" />,
      content: <ThemeDemoContent />
    },
    {
      id: 'error-handling',
      label: 'Error Handling',
      icon: <AlertTriangle className="h-4 w-4" />,
      content: <ErrorHandlingExample />
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-4 w-4" />,
      content: <NotificationHandlerExample />
    },
    {
      id: 'socket',
      label: 'Socket Connection',
      icon: <Wifi className="h-4 w-4" />,
      content: <SocketConnectionDemo />
    },
    {
      id: 'forms',
      label: 'Form Validation',
      icon: <FileText className="h-4 w-4" />,
      content: <FormValidationDemo />
    },
    {
      id: 'components',
      label: 'UI Components',
      icon: <Code className="h-4 w-4" />,
      content: <ComponentsDemoContent />
    },
    {
      id: 'docs',
      label: 'Documentation',
      icon: <BookOpen className="h-4 w-4" />,
      content: <DocumentationContent />
    }
  ];

  return (
    <div className="min-h-screen bg-page-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-background shadow-sm rounded-lg p-8 space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Link href="/" className="mr-4">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to App
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Consensus Demo Center
            </h1>
            <p className="text-muted-foreground text-lg">
              Explore all the features and components of the Consensus application
            </p>
          </div>

          {/* Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs tabs={tabs} defaultTab="theme" />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}