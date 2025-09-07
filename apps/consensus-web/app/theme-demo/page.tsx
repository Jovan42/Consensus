'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Alert } from '@/app/components/ui/Alert';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { useTheme } from '@/app/contexts/ThemeContext';
import { getRoleColors, getStatusColors } from '@/lib/color-utils';

export default function ThemeDemoPage() {
  const { theme, resolvedTheme } = useTheme();
  const roles = ['admin', 'manager', 'member', 'test'];
  const statuses = ['success', 'error', 'warning', 'info'] as const;

  return (
    <div className="min-h-screen bg-page-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-background shadow-sm rounded-lg p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Dark Theme Demo
          </h1>
          <p className="text-muted-foreground text-lg">
            Experience the power of our centralized color system with automatic theme switching
          </p>
        </div>

        {/* Theme Controls */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">Theme Controls</h2>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Color System Showcase */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">Color System Showcase</h2>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>

        {/* Semantic Colors Demo */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">Semantic Colors</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-foreground">Backgrounds</h3>
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
                <h3 className="text-lg font-medium text-foreground">Interactive Elements</h3>
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
          </CardContent>
        </Card>

        {/* Theme Information */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">Theme Information</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-medium text-foreground mb-2">Light Theme</h4>
                <p className="text-sm text-muted-foreground">
                  Clean, bright interface with dark text on light backgrounds
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-medium text-foreground mb-2">Dark Theme</h4>
                <p className="text-sm text-muted-foreground">
                  Easy on the eyes with light text on dark backgrounds
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-medium text-foreground mb-2">System Theme</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically follows your system's theme preference
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
