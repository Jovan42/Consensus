# Shared Database Setup Guide

This guide explains how to use the same PostgreSQL database for both local development and production deployment.

## 🗄️ Database Setup

### 1. Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Choose a name (e.g., "consensus-db")
4. Select the free tier
5. Click **"Create Database"**

### 2. Get Database Connection String

1. Once created, go to your PostgreSQL service
2. Copy the **"External Database URL"**
3. It will look like: `postgresql://username:password@hostname:port/database`

## 🔧 Local Development Setup

### 1. Update Local Environment Variables

Create/update `apps/consensus-api/.env`:

```bash
# Database - Use the same database for both local and production
DATABASE_URL=postgresql://username:password@hostname:port/database

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

### 2. Run Migrations Locally

```bash
cd apps/consensus-api
npm run migrate
```

This will:
- Connect to the shared database
- Run all migrations to create tables
- Populate test users for development

### 3. Start Local Development

```bash
# Terminal 1: Start API
cd apps/consensus-api
npm run dev

# Terminal 2: Start Frontend
cd apps/consensus-web
npm run dev
```

## 🚀 Production Deployment Setup

### 1. Update Production Environment Variables

In your Render API service, add these environment variables:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://username:password@hostname:port/database
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### 2. Deploy

The production deployment will automatically:
- Connect to the shared database
- Run migrations to ensure tables are up to date
- Start the API server

## 🔄 Database Management

### Running Migrations

```bash
# Run migrations locally
npm run migrate

# Or run specific migration commands
npm run migration:run
```

### Adding New Migrations

```bash
# Generate new migration
npm run migration:generate -- src/migrations/YourMigrationName

# Run migrations
npm run migration:run
```

## ⚠️ Important Notes

1. **Never use `synchronize: true`** in production - it can cause data loss
2. **Always use migrations** for schema changes
3. **Test migrations locally** before deploying to production
4. **Backup your database** before major schema changes
5. **Use the same database** for both environments to avoid data inconsistencies

## 🐛 Troubleshooting

### Database Connection Issues

1. Check that `DATABASE_URL` is correctly set
2. Verify the database is accessible from your IP
3. Check Render database logs for connection issues

### Migration Issues

1. Check migration files are in `src/migrations/` directory
2. Verify migration syntax is correct
3. Run migrations locally first to test

### Data Issues

1. Check if test users were populated: `npm run populate:users`
2. Verify database tables exist
3. Check database logs for errors
