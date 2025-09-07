# Development Guide

This guide will help you set up and run the Consensus application locally for development.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 (comes with Node.js)
- **Git** (for version control)
- **PostgreSQL** (optional for MVP - can use local or cloud database)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Jovan42/Consensus.git
cd Consensus
```

### 2. Install Dependencies

```bash
npm install
```

This will install dependencies for all packages in the monorepo.

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp apps/consensus-api/env.example apps/consensus-api/.env

# Edit the .env file with your configuration
nano apps/consensus-api/.env
```

**Required Environment Variables:**
```env
# Database (optional for MVP)
DATABASE_URL=postgresql://username:password@localhost:5432/consensus_db

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:web    # Frontend only (port 3000)
npm run dev:api    # Backend only (port 3001)
```

### 5. Verify Installation

- **Frontend**: Visit http://localhost:3000
- **Backend**: Visit http://localhost:3001/health

## 🏗️ Project Structure

```
Consensus/
├── apps/
│   ├── consensus-web/          # Next.js frontend
│   │   ├── app/               # App Router pages
│   │   │   ├── components/    # React components
│   │   │   │   ├── auth/      # Authentication components
│   │   │   │   ├── layout/    # Layout components
│   │   │   │   ├── ui/        # UI components (Button, Card, etc.)
│   │   │   │   └── examples/  # Example/demo components
│   │   │   ├── contexts/      # React contexts (Auth, Theme)
│   │   │   └── theme-demo/    # Theme demonstration page
│   │   ├── lib/              # Utility functions
│   │   │   ├── colors.ts     # Centralized color system
│   │   │   ├── color-utils.ts # Color utility functions
│   │   │   └── utils.ts      # General utilities
│   │   ├── docs/             # Frontend-specific documentation
│   │   └── package.json      # Frontend dependencies
│   └── consensus-api/         # Express.js backend
│       ├── src/
│       │   ├── entities/     # TypeORM database entities
│       │   ├── routes/       # API route handlers
│       │   ├── middleware/   # Express middleware
│       │   ├── config/       # Configuration files
│       │   └── types/        # TypeScript type definitions
│       └── package.json      # Backend dependencies
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── eslint-config/        # Shared ESLint config
│   └── typescript-config/    # Shared TypeScript config
├── docs/                     # Documentation
└── package.json              # Root package.json
```

## 🛠️ Available Scripts

### Root Level Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:web          # Start frontend only
npm run dev:api          # Start backend only

# Building
npm run build            # Build all apps and packages
npm run start            # Start production servers

# Code Quality
npm run lint             # Lint all apps and packages
npm run check-types      # Type check all apps and packages
npm run format           # Format code with Prettier
```

### Frontend Scripts (consensus-web)

```bash
cd apps/consensus-web

npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Lint code
npm run check-types      # Type check
```

### Backend Scripts (consensus-api)

```bash
cd apps/consensus-api

npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server
npm run lint             # Lint code
npm run check-types      # Type check
```

## 🗄️ Database Setup

### Option 1: Local PostgreSQL

1. **Install PostgreSQL**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS (with Homebrew)
   brew install postgresql
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE consensus_db;
   CREATE USER consensus_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE consensus_db TO consensus_user;
   \q
   ```

3. **Update Environment Variables**:
   ```env
   DATABASE_URL=postgresql://consensus_user:your_password@localhost:5432/consensus_db
   ```

### Option 2: Cloud Database (Render)

1. **Create PostgreSQL Database on Render**:
   - Go to https://render.com
   - Create a new PostgreSQL database
   - Copy the connection string

2. **Update Environment Variables**:
   ```env
   DATABASE_URL=postgresql://username:password@hostname:port/database
   ```

### Option 3: Skip Database (MVP Development)

For MVP development, you can skip the database setup. The API will run without database connection and show a warning message.

## 🔧 Development Workflow

### 1. Making Changes

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**:
   - Edit files in `apps/consensus-web/` for frontend changes
   - Edit files in `apps/consensus-api/` for backend changes

3. **Test Your Changes**:
   ```bash
   npm run lint
   npm run check-types
   npm run dev  # Test locally
   ```

4. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature-name
   ```

### 2. API Development

**Adding New Endpoints**:
1. Create route handler in `apps/consensus-api/src/routes/`
2. Add validation with class-validator
3. Update API documentation in `docs/API-ENDPOINTS.md`
4. Test with Postman or curl

**Example API Endpoint**:
```typescript
// apps/consensus-api/src/routes/clubs.ts
import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Club } from '../entities/Club';

const router = Router();

router.get('/clubs', async (req, res) => {
  try {
    const clubs = await AppDataSource.getRepository(Club).find();
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
```

### 3. Frontend Development

**Adding New Components**:
1. Create component in `apps/consensus-web/components/`
2. Add TypeScript types
3. Use Tailwind CSS for styling
4. Implement form validation with React Hook Form + Zod

**Example Component**:
```typescript
// apps/consensus-web/components/ClubCard.tsx
import { Club } from '../types/club';

interface ClubCardProps {
  club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold">{club.name}</h3>
      <p className="text-gray-600">Type: {club.type}</p>
    </div>
  );
}
```

## 🎨 Theme System

The application includes a comprehensive theme system with both light and dark modes.

### Theme Features

- **🌙 Dark Mode**: Complete dark theme implementation
- **🎨 Centralized Color System**: All colors defined in one place
- **🔄 Theme Toggle**: Easy switching between light/dark/system themes
- **📱 Responsive**: Themes work across all devices
- **♿ Accessible**: Colors meet WCAG contrast requirements

### Theme Components

- **ThemeContext**: React context for theme state management
- **ThemeToggle**: UI component for switching themes
- **ThemeScript**: Prevents flash of unstyled content (FOUC)
- **Color System**: Centralized color definitions and utilities

### Using Themes in Development

```tsx
// Access theme in components
import { useTheme } from '@/app/contexts/ThemeContext';

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  return (
    <div className="bg-background text-foreground">
      <p>Current theme: {resolvedTheme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to Dark
      </button>
    </div>
  );
}
```

### Color System Usage

```tsx
// Use semantic colors (recommended)
<div className="bg-background text-foreground">
<button className="bg-primary text-primary-foreground">
<Alert variant="success">Success message</Alert>

// Use utility functions for dynamic colors
import { getRoleColors } from '@/lib/color-utils';
const colors = getRoleColors('admin');
```

### Theme Demo Page

Visit `/theme-demo` (admin only) to see all theme features and color variations in action.

For detailed information, see the [Color System Documentation](../apps/consensus-web/docs/COLOR-SYSTEM.md).

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run frontend tests
cd apps/consensus-web && npm test

# Run backend tests
cd apps/consensus-api && npm test
```

### API Testing

**Using curl**:
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test clubs endpoint
curl http://localhost:3001/api/clubs
```

**Using Postman**:
1. Import the API collection (to be created)
2. Set base URL to `http://localhost:3001`
3. Test all endpoints

## 🐛 Troubleshooting

### Common Issues

**1. Port Already in Use**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**2. Database Connection Issues**:
- Check if PostgreSQL is running
- Verify connection string in `.env`
- Ensure database exists and user has permissions

**3. SSL/TLS Required Error (Render PostgreSQL)**:
- Render PostgreSQL requires SSL connections
- Add `?sslmode=require` to your DATABASE_URL
- Example: `postgresql://user:pass@host:port/db?sslmode=require`

**4. Module Resolution Issues**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**4. TypeScript Errors**:
```bash
# Check TypeScript configuration
npm run check-types

# Restart TypeScript server in your editor
```

### Getting Help

1. **Check the logs**:
   - Frontend: Browser console and terminal
   - Backend: Terminal output

2. **Verify environment variables**:
   - Check `.env` file exists and has correct values
   - Ensure no typos in variable names

3. **Check dependencies**:
   - Run `npm install` to ensure all packages are installed
   - Check for version conflicts

## 📚 Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Express.js Documentation**: https://expressjs.com/
- **TypeORM Documentation**: https://typeorm.io/
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **Turborepo Documentation**: https://turbo.build/repo/docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

For more details, see the main README.md file.
