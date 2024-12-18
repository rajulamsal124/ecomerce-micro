# Troubleshooting Guide

## Table of Contents
- [Common Issues](#common-issues)
- [Development Environment](#development-environment)
- [Production Environment](#production-environment)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)
- [Monitoring & Debugging](#monitoring--debugging)

## Common Issues

### 1. Service Startup Issues

#### Problem: Service fails to start
```bash
# Check service logs
docker-compose logs user-service

# Common causes:
- Database connection issues
- Port conflicts
- Environment variables missing
```

#### Solution:
1. Verify environment variables:
```bash
# Check if .env file exists
ls -la .env

# Verify environment variables are loaded
docker-compose config
```

2. Check port availability:
```bash
# Check if port is in use
lsof -i :3000

# Kill process using port
kill -9 <PID>
```

3. Verify database connection:
```bash
# Test database connection
nc -zv localhost 5432
```

### 2. Build Errors

#### Problem: npm install fails
```bash
# Common error messages:
- node-gyp rebuild failed
- peer dependencies conflict
```

#### Solution:
1. Clear npm cache:
```bash
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

2. Update Node.js version:
```bash
nvm install 18
nvm use 18
```

3. Check for conflicting dependencies:
```bash
npm ls
```

## Development Environment

### 1. Docker Issues

#### Problem: Docker container not starting
```bash
# Check container status
docker ps -a

# View container logs
docker logs <container_id>
```

#### Solution:
1. Reset Docker environment:
```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild containers
docker-compose up --build
```

2. Check Docker disk space:
```bash
# View disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

### 2. Hot Reload Issues

#### Problem: Changes not reflecting in development
```typescript
// nest-cli.json
{
  "watchOptions": {
    "watchFolders": ["src"],
    "ignore": ["node_modules"]
  }
}
```

#### Solution:
1. Verify file watching:
```bash
# Check if files are being watched
npm run start:dev -- --debug
```

2. Update Docker volume configuration:
```yaml
# docker-compose.yml
services:
  user-service:
    volumes:
      - .:/app
      - /app/node_modules
```

## Production Environment

### 1. Kubernetes Issues

#### Problem: Pods not starting
```bash
# Check pod status
kubectl get pods
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>
```

#### Solution:
1. Check resource constraints:
```yaml
# Update resource limits
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

2. Verify ConfigMaps and Secrets:
```bash
# List ConfigMaps
kubectl get configmaps

# List Secrets
kubectl get secrets
```

### 2. Deployment Issues

#### Problem: Failed deployments
```bash
# Check deployment status
kubectl rollout status deployment/user-service

# View deployment history
kubectl rollout history deployment/user-service
```

#### Solution:
1. Rollback deployment:
```bash
# Rollback to previous version
kubectl rollout undo deployment/user-service

# Rollback to specific revision
kubectl rollout undo deployment/user-service --to-revision=2
```

2. Check deployment events:
```bash
kubectl describe deployment user-service
```

## Database Issues

### 1. Connection Problems

#### Problem: Database connection failures
```typescript
// Check connection configuration
const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};
```

#### Solution:
1. Test database connection:
```bash
# Using psql
psql -h localhost -U postgres -d ecommerce

# Using connection URL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce
```

2. Check database logs:
```bash
# PostgreSQL logs
tail -f /var/log/postgresql/postgresql-15-main.log
```

### 2. Migration Issues

#### Problem: Failed migrations
```bash
# Check migration status
npm run typeorm migration:show

# View migration logs
npm run typeorm migration:run -- --debug
```

#### Solution:
1. Reset migrations:
```bash
# Revert last migration
npm run typeorm migration:revert

# Run migrations
npm run typeorm migration:run
```

2. Debug migration queries:
```typescript
// Enable query logging
TypeOrmModule.forRoot({
  logging: true,
  logger: 'advanced-console'
})
```

## Performance Issues

### 1. Slow Queries

#### Problem: Database queries taking too long
```sql
-- Check slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE pg_stat_activity.query != ''::text 
  AND state != 'idle'
  AND now() - pg_stat_activity.query_start > interval '5 seconds'
ORDER BY duration DESC;
```

#### Solution:
1. Analyze query performance:
```sql
-- Analyze query plan
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Add indexes
CREATE INDEX idx_users_email ON users(email);
```

2. Implement caching:
```typescript
// Redis caching
@CacheKey('user-profile')
@CacheTTL(300)
async getUserProfile(id: string) {
  return this.userRepository.findOne(id);
}
```

### 2. Memory Leaks

#### Problem: Service memory increasing over time
```bash
# Check memory usage
docker stats

# Node.js memory usage
node --inspect
```

#### Solution:
1. Generate heap snapshot:
```bash
# Using Node.js inspector
node --inspect-brk index.js

# Using Chrome DevTools
chrome://inspect
```

2. Analyze memory usage:
```javascript
// Memory usage logging
const used = process.memoryUsage();
console.log(`Memory usage: ${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`);
```

## Monitoring & Debugging

### 1. Logging Setup

```typescript
// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. Metrics Collection

```typescript
// Prometheus metrics
const counter = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

// Track requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    counter.inc({
      method: req.method,
      path: req.path,
      status: res.statusCode
    });
  });
  next();
});
```

### 3. Error Tracking

```typescript
// Global exception filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Log error
    logger.error('Unhandled exception', {
      exception,
      path: request.url,
      method: request.method,
      body: request.body,
      headers: request.headers
    });

    response
      .status(500)
      .json({
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: 'Internal server error'
      });
  }
}
```

### 4. Health Checks

```typescript
// Health check endpoint
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis')
    ]);
  }
}
```

## Emergency Procedures

### 1. Service Recovery

```bash
# Restart service
kubectl rollout restart deployment user-service

# Scale down/up
kubectl scale deployment user-service --replicas=0
kubectl scale deployment user-service --replicas=3
```

### 2. Data Recovery

```bash
# Backup database
pg_dump -h localhost -U postgres -d ecommerce > backup.sql

# Restore database
psql -h localhost -U postgres -d ecommerce < backup.sql
```

### 3. Circuit Breaking

```typescript
// Circuit breaker implementation
@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  private failureCount = 0;
  private lastFailureTime: number = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (this.isOpen()) {
      throw new ServiceUnavailableException();
    }

    return next.handle().pipe(
      catchError(error => {
        this.recordFailure();
        throw error;
      })
    );
  }

  private isOpen(): boolean {
    if (this.failureCount >= this.threshold) {
      const now = Date.now();
      if (now - this.lastFailureTime < this.timeout) {
        return true;
      }
      this.reset();
    }
    return false;
  }

  private recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }

  private reset() {
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}
```
