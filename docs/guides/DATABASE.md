# Database Schema and Migration Guide

## Table of Contents
- [Database Architecture](#database-architecture)
- [Schema Design](#schema-design)
- [Migrations](#migrations)
- [Best Practices](#best-practices)

## Database Architecture

### Service-Specific Databases

Each microservice has its own database to ensure loose coupling and independent scaling:

1. User Service DB (ecommerce_users)
2. Product Service DB (ecommerce_products)
3. Order Service DB (ecommerce_orders)
4. Payment Service DB (ecommerce_payments)

## Schema Design

### User Service Schema

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles Table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Product Service Schema

```sql
-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES categories(id),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Images Table
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Order Service Schema

```sql
-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Migrations

### TypeORM Migrations

1. Generate Migration:
```bash
npm run typeorm:migration:generate -- -n MigrationName
```

2. Run Migrations:
```bash
npm run typeorm:migration:run
```

3. Revert Migration:
```bash
npm run typeorm:migration:revert
```

### Example Migration File

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1234567890123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE users;`);
    }
}
```

## Best Practices

### 1. Schema Design

- Use UUIDs for primary keys
- Include created_at and updated_at timestamps
- Implement soft deletes where appropriate
- Use appropriate data types and constraints
- Follow naming conventions consistently

### 2. Indexing

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
```

### 3. Constraints

```sql
-- Add check constraints
ALTER TABLE products 
ADD CONSTRAINT check_price_positive 
CHECK (price >= 0);

ALTER TABLE order_items 
ADD CONSTRAINT check_quantity_positive 
CHECK (quantity > 0);
```

### 4. Performance Optimization

1. Partitioning Large Tables:
```sql
-- Partition orders table by created_at
CREATE TABLE orders (
    id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    -- other columns
) PARTITION BY RANGE (created_at);

-- Create partitions
CREATE TABLE orders_2024_q1 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

2. Materialized Views:
```sql
-- Create materialized view for product statistics
CREATE MATERIALIZED VIEW product_stats AS
SELECT 
    p.id,
    p.name,
    COUNT(oi.id) as total_orders,
    SUM(oi.quantity) as total_quantity_sold
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name;
```

### 5. Backup and Recovery

1. Backup Script:
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U postgres -d ecommerce_users > backup_users_${TIMESTAMP}.sql
```

2. Recovery:
```bash
psql -h localhost -U postgres -d ecommerce_users < backup_file.sql
```

## Troubleshooting

### Common Issues

1. Connection Issues:
```bash
# Check PostgreSQL status
sudo service postgresql status

# View PostgreSQL logs
tail -f /var/log/postgresql/postgresql-15-main.log
```

2. Performance Issues:
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = 'some-uuid';

-- View slow queries
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

3. Lock Issues:
```sql
-- View locked tables
SELECT relation::regclass, * FROM pg_locks WHERE NOT GRANTED;

-- Kill blocking process
SELECT pg_terminate_backend(pid);
```

## Monitoring

### Key Metrics to Monitor

1. Connection Pool:
```sql
SELECT * FROM pg_stat_activity;
```

2. Table Statistics:
```sql
SELECT schemaname, relname, seq_scan, seq_tup_read, 
       idx_scan, idx_tup_fetch, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables;
```

3. Index Usage:
```sql
SELECT schemaname, relname, indexrelname, idx_scan, 
       idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes;
```
