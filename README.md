# Consensus - Book Club & Activity Management App

A full-stack application for managing book clubs and other group activities with voting and recommendation systems.

## 🎯 Project Overview

Consensus is a generic platform for group decision-making that can be used for:
- **Book Clubs** - Choose next book to read
- **Movie Nights** - Select films to watch together  
- **Restaurant Groups** - Decide where to eat
- **Travel Planning** - Select destinations and activities
- **Gaming Groups** - Pick board games or video games
- **Learning Groups** - Select courses or workshops
- **Event Planning** - Select venues and themes
- And many more use cases!

## 🏗️ Architecture

This is a Turborepo monorepo containing:

### Apps
- **`consensus-web`** - Next.js 14 frontend with App Router, TypeScript, Tailwind CSS
- **`consensus-api`** - Express.js backend with TypeScript, PostgreSQL, TypeORM

### Packages
- **`ui`** - Shared React component library
- **`eslint-config`** - Shared ESLint configurations
- **`typescript-config`** - Shared TypeScript configurations

## 🚀 Technology Stack

### Frontend (consensus-web)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **Data Fetching**: SWR (Stale-While-Revalidate)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Real-time**: Socket.io Client (Phase 2)

### Backend (consensus-api)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: Auth0 (Phase 2 - initially no auth for MVP)
- **Real-time**: Socket.io
- **Validation**: class-validator
- **Security**: Helmet, CORS, Rate Limiting

## 📋 MVP Workflow

1. **Create Club** → Set name, type, configuration
2. **Add Members** → Add 3+ members to the club
3. **Start Turn** → One member becomes the recommender
4. **Recommend** → Recommender picks items (min/max based on config)
5. **Vote** → All members vote with points (e.g., [3,2,1] or [5,4,3,2,1])
6. **Close Vote** → Pick winning item
7. **Mark Complete** → Members mark when they're done with the item
8. **Finish Round** → Move to next member's turn

## ⚙️ Configuration Options

- **Min/max recommendations** (e.g., books: 3-5, movies: 1-3)
- **Voting point systems** (e.g., [3,2,1] for 3 items, [5,4,3,2,1] for 5+ items)
- **Turn order** (sequential A→B→C→A vs random)
- **Tie-breaking method** (random, recommender decides, re-vote)
- **Minimum participation** (e.g., 80% of members must vote)

## 🛠️ Development

### Prerequisites
- Node.js >= 18
- PostgreSQL (local or Render)

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy example environment file
   cp apps/consensus-api/env.example apps/consensus-api/.env
   
   # Edit the .env file with your database URL
   ```

4. Start development servers:
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:web    # Frontend only (port 3000)
   npm run dev:api    # Backend only (port 3001)
   ```

### Available Scripts

- `npm run build` - Build all apps and packages
- `npm run dev` - Develop all apps and packages
- `npm run dev:web` - Start frontend only
- `npm run dev:api` - Start backend only
- `npm run start` - Start production servers
- `npm run lint` - Lint all apps and packages
- `npm run check-types` - Type check all apps and packages
- `npm run format` - Format all code with Prettier

## 🚀 Deployment

- **Frontend**: Vercel (automatic deployment from main branch)
- **Backend**: Render (production environment)
- **Database**: Render PostgreSQL (managed database)

## 📱 Future Phases

### Phase 2
- OAuth authentication (Auth0)
- Real-time updates with Socket.io
- Discussion scheduling
- Rating and review system
- Mobile apps (iOS/Android)

### Phase 3+
- Advanced analytics
- Social features
- Integration with external APIs
- Advanced scheduling and notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[API Endpoints](./docs/API-ENDPOINTS.md)** - Complete API documentation
- **[Development Phases](./docs/DEVELOPMENT-PHASES.md)** - Project roadmap with progress tracking
- **[Project Description](./docs/PROJECT-DESCRIPTION.md)** - Use cases and workflow details
- **[Development Guide](./docs/DEVELOPMENT-GUIDE.md)** - Local setup and development guide

## 📄 License

This project is licensed under the MIT License.