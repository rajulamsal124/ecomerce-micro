# Service Setup Instructions

## Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Service-Specific Setup](#service-specific-setup)
- [Development Environment](#development-environment)

## Prerequisites

### Required Software
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (15+)
- Git
- Visual Studio Code (recommended)

### Global Dependencies
```bash
# Install NestJS CLI
npm install -g @nestjs/cli

# Install TypeScript
npm install -g typescript

# Install pnpm (optional but recommended)
npm install -g pnpm
```

## Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/ecommerce-platform.git
cd ecommerce-platform
```

2. Install root dependencies:
```bash
npm install
```

3. Copy environment files:
```bash
cp .env.example .env
```

## Service-Specific Setup

### 1. User Service

```bash
cd services/user-service

# Install dependencies
npm install

# Generate GraphQL types
npm run generate:types

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```

Configuration:
```typescript
// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ecommerce_users'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '1d'
  }
});
```

### 2. Product Service

```bash
cd services/product-service

# Install dependencies
npm install

# Generate GraphQL types
npm run generate:types

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```

Configuration:
```typescript
// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3002,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ecommerce_products'
  },
  imageStorage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    bucket: process.env.STORAGE_BUCKET || 'products'
  }
});
```

### 3. Frontend Web Application

```bash
cd frontend/web

# Install dependencies
npm install

# Start development server
npm run dev
```

Configuration:
```typescript
// src/config/config.ts
export const config = {
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3000',
  graphqlUrl: process.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql',
  environment: process.env.NODE_ENV || 'development'
};
```

## Development Environment

### VSCode Extensions
Install the following extensions for optimal development experience:

- ESLint
- Prettier
- GraphQL
- Docker
- Jest Runner
- Git Lens

### VSCode Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Git Hooks
```bash
# Install husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint-staged"
```

### Docker Development Environment

Start all services:
```bash
docker-compose up -d
```

Start specific service:
```bash
docker-compose up user-service -d
```

View logs:
```bash
docker-compose logs -f [service-name]
```

### Database Management

Connect to PostgreSQL:
```bash
docker-compose exec postgres psql -U postgres
```

Create new database:
```sql
CREATE DATABASE ecommerce_users;
CREATE DATABASE ecommerce_products;
```

### Troubleshooting Common Setup Issues

1. Port Conflicts
```bash
# Check ports in use
lsof -i :[port-number]

# Kill process using port
kill -9 [PID]
```

2. Database Connection Issues
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres
```

3. Node.js Version Mismatch
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use correct Node version
nvm install 18
nvm use 18
```

### Health Checks

Verify services are running:

1. User Service: http://localhost:3001/health
2. Product Service: http://localhost:3002/health
3. Frontend: http://localhost:5173

## Next Steps

After completing the setup:

1. Review the API Documentation
2. Set up your Development Workflow
3. Read the Testing Guide
4. Configure your CI/CD Pipeline
