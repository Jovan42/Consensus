'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Alert } from '@/app/components/ui/Alert';
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-page-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="bg-background border-border">
          <CardContent className="p-8 text-center space-y-6">
            
            {/* 404 Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">404</h1>
              <h2 className="text-xl font-semibold text-foreground">Page Not Found</h2>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            {/* Helpful Actions */}
            <div className="space-y-3">
              <Alert variant="info">
                <Search className="h-4 w-4" />
                <div className="text-sm">
                  <strong>Looking for something specific?</strong>
                  <br />
                  Try checking the URL or navigating from the main menu.
                </div>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/" className="flex-1">
                  <Button variant="primary" className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>

            {/* Additional Help */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                If you believe this is an error, please contact support.
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
