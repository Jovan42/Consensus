'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Users, Home, Settings } from 'lucide-react';

export function Header() {
  const { state } = useApp();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Consensus</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            {state.currentClub && (
              <Link
                href={`/clubs/${state.currentClub.id}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {state.currentClub.name}
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
