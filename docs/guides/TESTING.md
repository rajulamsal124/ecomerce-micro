# Testing Guide

## Table of Contents
- [Testing Strategy](#testing-strategy)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing](#e2e-testing)
- [Performance Testing](#performance-testing)
- [Test Coverage](#test-coverage)

## Testing Strategy

### Test Pyramid
```
     E2E Tests     
    /          \    
   /  Integration \ 
  /     Tests      \
 /                  \
/     Unit Tests     \
----------------------
```

### Test Types
1. Unit Tests: Individual components and functions
2. Integration Tests: Service interactions
3. E2E Tests: Complete user flows
4. Performance Tests: Load and stress testing

## Unit Testing

### 1. Service Tests

```typescript
// user.service.spec.ts
import { Test } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await service.create(userData);
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
    });

    it('should throw error if email exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      await expect(service.create(userData)).rejects.toThrow();
    });
  });
});
```

### 2. Controller Tests

```typescript
// product.controller.spec.ts
describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  describe('findAll', () => {
    it('should return array of products', async () => {
      const result = await controller.findAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
```

### 3. Repository Tests

```typescript
// order.repository.spec.ts
describe('OrderRepository', () => {
  let repository: OrderRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderRepository,
        {
          provide: getRepositoryToken(Order),
          useClass: MockRepository,
        },
      ],
    }).compile();

    repository = module.get<OrderRepository>(OrderRepository);
  });

  describe('findByUser', () => {
    it('should return user orders', async () => {
      const userId = 'test-user-id';
      const orders = await repository.findByUser(userId);
      expect(orders).toBeDefined();
    });
  });
});
```

## Integration Testing

### 1. Service Integration Tests

```typescript
// order-processing.integration.spec.ts
describe('Order Processing Integration', () => {
  let orderService: OrderService;
  let paymentService: PaymentService;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        OrderModule,
        PaymentModule,
        NotificationModule,
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    paymentService = module.get<PaymentService>(PaymentService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  describe('createOrder', () => {
    it('should process order and send notification', async () => {
      const orderData = {
        userId: 'test-user',
        items: [{ productId: 'test-product', quantity: 1 }],
      };

      const order = await orderService.create(orderData);
      expect(order).toBeDefined();
      expect(paymentService.processPayment).toHaveBeenCalled();
      expect(notificationService.sendOrderConfirmation).toHaveBeenCalled();
    });
  });
});
```

### 2. API Integration Tests

```typescript
// user-api.integration.spec.ts
describe('User API Integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/POST register', () => {
    return request(app.getHttpServer())
      .post('/api/v1/users/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201)
      .expect(res => {
        expect(res.body.email).toBe('test@example.com');
      });
  });
});
```

## E2E Testing

### 1. Cypress Tests

```typescript
// cypress/integration/checkout.spec.ts
describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
  });

  it('should complete checkout process', () => {
    // Add product to cart
    cy.visit('/products');
    cy.get('[data-testid="product-1"]').click();
    cy.get('[data-testid="add-to-cart"]').click();

    // Go to cart
    cy.get('[data-testid="cart-icon"]').click();
    cy.get('[data-testid="checkout-button"]').click();

    // Fill shipping info
    cy.get('[data-testid="shipping-form"]').within(() => {
      cy.get('[name="address"]').type('123 Test St');
      cy.get('[name="city"]').type('Test City');
      cy.get('[name="zipCode"]').type('12345');
    });

    // Complete payment
    cy.get('[data-testid="payment-form"]').within(() => {
      cy.get('[name="cardNumber"]').type('4242424242424242');
      cy.get('[name="expiry"]').type('1225');
      cy.get('[name="cvc"]').type('123');
    });

    cy.get('[data-testid="submit-payment"]').click();

    // Verify order confirmation
    cy.url().should('include', '/order-confirmation');
    cy.get('[data-testid="order-status"]').should('contain', 'confirmed');
  });
});
```

### 2. API E2E Tests

```typescript
// test/app.e2e-spec.ts
describe('E2E API Tests', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get JWT token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    jwtToken = loginResponse.body.token;
  });

  describe('Order Flow', () => {
    it('should create and process order', async () => {
      // Create order
      const orderResponse = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          items: [{ productId: 'test-product', quantity: 1 }],
        })
        .expect(201);

      const orderId = orderResponse.body.id;

      // Check order status
      await request(app.getHttpServer())
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.status).toBe('processing');
        });
    });
  });
});
```

## Performance Testing

### 1. Load Testing with k6

```javascript
// tests/performance/api-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/products');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

### 2. Stress Testing

```javascript
// tests/performance/api-stress.js
export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 500,
      timeUnit: '1s',
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '2m', target: 0 },
      ],
    },
  },
};
```

## Test Coverage

### 1. Jest Configuration

```javascript
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### 2. Coverage Reports

```bash
# Generate coverage report
npm run test:cov

# Generate and open detailed HTML report
npm run test:cov && open coverage/lcov-report/index.html
```

### 3. CI Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests with coverage
        run: npm run test:cov
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Best Practices

1. Follow AAA Pattern (Arrange-Act-Assert)
2. Use meaningful test descriptions
3. Keep tests independent
4. Mock external dependencies
5. Use test data factories
6. Maintain test coverage thresholds
7. Run tests in CI/CD pipeline

## Troubleshooting

### Common Issues

1. Flaky Tests
```typescript
// Add retry logic for flaky tests
jest.retryTimes(3);
```

2. Timeouts
```typescript
// Increase timeout for slow tests
jest.setTimeout(30000);
```

3. Memory Leaks
```typescript
// Clean up after tests
afterEach(async () => {
  await app.close();
});
```
