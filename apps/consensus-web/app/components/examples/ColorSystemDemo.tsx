'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { getRoleColors, getStatusColors } from '@/lib/color-utils';

/**
 * Demo component showcasing the centralized color system
 * This component demonstrates how to use the color system in practice
 */
export function ColorSystemDemo() {
  const roles = ['admin', 'manager', 'member', 'test'];
  const statuses = ['success', 'error', 'warning', 'info'] as const;

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Color System Demo</h1>
        <p className="text-muted-foreground">
          This component demonstrates the centralized color system in action.
        </p>
      </div>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-card-foreground">Button Variants</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert Variants */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-card-foreground">Alert Variants</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statuses.map((status) => (
              <Alert key={status} variant={status}>
                This is a {status} alert message.
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Badges */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-card-foreground">Role-Based Colors</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
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
        </CardContent>
      </Card>

      {/* Color Palette Preview */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-card-foreground">Color Palette</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Blue Palette */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Blue</h3>
              <div className="space-y-1">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div
                    key={shade}
                    className={`h-8 rounded flex items-center px-2 text-xs font-medium ${
                      shade >= 500 ? 'text-white' : 'text-gray-900'
                    }`}
                    style={{ backgroundColor: `hsl(var(--blue-${shade}))` }}
                  >
                    {shade}
                  </div>
                ))}
              </div>
            </div>

            {/* Gray Palette */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Gray</h3>
              <div className="space-y-1">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div
                    key={shade}
                    className={`h-8 rounded flex items-center px-2 text-xs font-medium ${
                      shade >= 500 ? 'text-white' : 'text-gray-900'
                    }`}
                    style={{ backgroundColor: `hsl(var(--gray-${shade}))` }}
                  >
                    {shade}
                  </div>
                ))}
              </div>
            </div>

            {/* Red Palette */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Red</h3>
              <div className="space-y-1">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div
                    key={shade}
                    className={`h-8 rounded flex items-center px-2 text-xs font-medium ${
                      shade >= 500 ? 'text-white' : 'text-gray-900'
                    }`}
                    style={{ backgroundColor: `hsl(var(--red-${shade}))` }}
                  >
                    {shade}
                  </div>
                ))}
              </div>
            </div>

            {/* Green Palette */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Green</h3>
              <div className="space-y-1">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div
                    key={shade}
                    className={`h-8 rounded flex items-center px-2 text-xs font-medium ${
                      shade >= 500 ? 'text-white' : 'text-gray-900'
                    }`}
                    style={{ backgroundColor: `hsl(var(--green-${shade}))` }}
                  >
                    {shade}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Semantic Colors */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-card-foreground">Semantic Colors</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Backgrounds</h3>
              <div className="space-y-1">
                <div className="h-8 rounded bg-background border border-border flex items-center px-2 text-xs">
                  background
                </div>
                <div className="h-8 rounded bg-card border border-border flex items-center px-2 text-xs">
                  card
                </div>
                <div className="h-8 rounded bg-muted flex items-center px-2 text-xs">
                  muted
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Interactive</h3>
              <div className="space-y-1">
                <div className="h-8 rounded bg-primary text-primary-foreground flex items-center px-2 text-xs">
                  primary
                </div>
                <div className="h-8 rounded bg-secondary text-secondary-foreground flex items-center px-2 text-xs">
                  secondary
                </div>
                <div className="h-8 rounded bg-destructive text-destructive-foreground flex items-center px-2 text-xs">
                  destructive
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
