# API Development Guidelines

## Table of Contents
- [API Design Principles](#api-design-principles)
- [GraphQL Schema Design](#graphql-schema-design)
- [REST Endpoints](#rest-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Error Handling](#error-handling)
- [Documentation](#documentation)

## API Design Principles

### 1. GraphQL First Approach

Use GraphQL as the primary API interface for:
- Complex queries with nested relationships
- Flexible data fetching
- Real-time updates with subscriptions

### 2. REST for Simple Operations

Use REST endpoints for:
- File uploads
- Simple CRUD operations
- Health checks
- Webhooks

### 3. API Versioning

- GraphQL: Use schema directives for versioning
- REST: Include version in URL path (/api/v1/...)

## GraphQL Schema Design

### 1. Base Types

```graphql
# User Types
type User {
  id: ID!
  email: String!
  firstName: String
  lastName: String
  role: UserRole!
  profile: UserProfile
  orders: [Order!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type UserProfile {
  id: ID!
  phone: String
  address: Address
  preferences: JSON
}

# Product Types
type Product {
  id: ID!
  name: String!
  description: String
  price: Float!
  category: Category!
  images: [ProductImage!]!
  stock: Int!
  status: ProductStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Order Types
type Order {
  id: ID!
  user: User!
  items: [OrderItem!]!
  totalAmount: Float!
  status: OrderStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### 2. Input Types

```graphql
input CreateUserInput {
  email: String!
  password: String!
  firstName: String
  lastName: String
}

input UpdateProductInput {
  name: String
  description: String
  price: Float
  categoryId: ID
  stock: Int
}

input CreateOrderInput {
  items: [OrderItemInput!]!
  shippingAddressId: ID!
}
```

### 3. Queries

```graphql
type Query {
  # User Queries
  me: User!
  user(id: ID!): User
  users(
    filter: UserFilterInput
    pagination: PaginationInput
  ): UserConnection!

  # Product Queries
  product(id: ID!): Product
  products(
    filter: ProductFilterInput
    pagination: PaginationInput
    sort: ProductSortInput
  ): ProductConnection!

  # Order Queries
  order(id: ID!): Order
  myOrders(
    filter: OrderFilterInput
    pagination: PaginationInput
  ): OrderConnection!
}
```

### 4. Mutations

```graphql
type Mutation {
  # User Mutations
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!

  # Product Mutations
  createProduct(input: CreateProductInput!): CreateProductPayload!
  updateProduct(id: ID!, input: UpdateProductInput!): UpdateProductPayload!
  deleteProduct(id: ID!): DeleteProductPayload!

  # Order Mutations
  createOrder(input: CreateOrderInput!): CreateOrderPayload!
  updateOrderStatus(id: ID!, status: OrderStatus!): UpdateOrderPayload!
}
```

### 5. Subscriptions

```graphql
type Subscription {
  orderStatusChanged(orderId: ID!): Order!
  productStockChanged(productId: ID!): Product!
  newOrderCreated: Order!
}
```

## REST Endpoints

### 1. API Structure

```typescript
// User Service Routes
@Controller('api/v1/users')
export class UserController {
  @Post()
  create(@Body() createUserDto: CreateUserDto) {}

  @Get(':id')
  findOne(@Param('id') id: string) {}

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {}

  @Delete(':id')
  remove(@Param('id') id: string) {}
}

// Product Service Routes
@Controller('api/v1/products')
export class ProductController {
  @Post('upload-image')
  uploadImage(@UploadedFile() file: Express.Multer.File) {}

  @Get(':id/download-specs')
  downloadSpecs(@Param('id') id: string) {}
}
```

### 2. Request/Response DTOs

```typescript
// Create User DTO
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

// Update Product DTO
export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
```

## Authentication & Authorization

### 1. JWT Authentication

```typescript
// Auth Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

// Role Guard
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const user = context.getArgByIndex(0).user;
    return roles.includes(user.role);
  }
}
```

### 2. GraphQL Authorization

```typescript
// GraphQL Auth Guard
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

// GraphQL Shield Rules
const permissions = shield({
  Query: {
    me: isAuthenticated,
    users: and(isAuthenticated, hasRole('ADMIN')),
  },
  Mutation: {
    createUser: not(isAuthenticated),
    updateUser: and(isAuthenticated, isOwner),
  },
});
```

## Error Handling

### 1. GraphQL Errors

```typescript
// Error Types
export const ErrorType = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

// Error Handler
@Catch()
export class GraphQLErrorFilter implements GqlExceptionFilter {
  catch(exception: Error) {
    return new GraphQLError(exception.message, {
      extensions: {
        code: getErrorCode(exception),
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

### 2. REST Errors

```typescript
// HTTP Exception Filter
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest<Request>().url,
      message: exception.message,
    });
  }
}
```

## Documentation

### 1. Swagger Documentation

```typescript
// Controller Documentation
@ApiTags('users')
@Controller('api/v1/users')
export class UserController {
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {}
}

// DTO Documentation
export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;
}
```

### 2. GraphQL Documentation

```graphql
"""
Represents a user in the system
"""
type User {
  """
  Unique identifier for the user
  """
  id: ID!

  """
  User's email address
  """
  email: String!
}

"""
Input type for creating a new user
"""
input CreateUserInput {
  """
  Email address must be unique
  """
  email: String!

  """
  Password must be at least 8 characters
  """
  password: String!
}
```

## Testing

### 1. Unit Tests

```typescript
describe('UserService', () => {
  it('should create a user', async () => {
    const result = await userService.create({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result).toBeDefined();
    expect(result.email).toBe('test@example.com');
  });
});
```

### 2. Integration Tests

```typescript
describe('UserResolver (e2e)', () => {
  it('should create user', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            createUser(input: {
              email: "test@example.com"
              password: "password123"
            }) {
              id
              email
            }
          }
        `,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data.createUser).toBeDefined();
      });
  });
});
```
