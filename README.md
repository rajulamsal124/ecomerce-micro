# E-commerce Microservices Application

A modern e-commerce platform built with microservices architecture using NestJS, React, and PostgreSQL.

## Architecture Overview

The application is built using a microservices architecture with the following components:

### 1. Frontend (React + TypeScript)
- Located in `/frontend/web`
- Built with React 18 and TypeScript
- Uses Chakra UI for styling
- Features:
  - User authentication (login/register)
  - Profile management
  - Product catalog (upcoming)
  - Shopping cart (upcoming)

### 2. Auth Service (NestJS)
- Located in `/services/auth-service`
- Handles user authentication and authorization
- Features:
  - User registration
  - User login
  - JWT-based authentication
  - Password hashing using Node's crypto module
  - PostgreSQL for user data storage

### 3. Product Service (NestJS)
- Located in `/services/product-service`
- Handles product management
- Features:
  - Product CRUD operations
  - Category management
  - Product search and filtering
  - Inventory management

## Frontend Implementation Guide

### 1. Product Pages

#### 1.1 Product List Page
```typescript
// src/pages/Products.tsx
import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Image,
  Text,
  Button,
  VStack,
  useToast,
  Skeleton,
  Container,
  Heading,
  SimpleGrid,
  Badge,
  Flex,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { useProducts } from '../contexts/ProductContext';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';

export const Products = () => {
  const { products, loading, error, fetchProducts } = useProducts();
  const toast = useToast();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  useEffect(() => {
    fetchProducts();
  }, []);

  if (error) {
    toast({
      title: 'Error',
      description: error,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={8}>Our Products</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        {loading
          ? Array(6)
              .fill(0)
              .map((_, i) => (
                <VStack key={i} spacing={4}>
                  <Skeleton height="200px" width="100%" />
                  <Skeleton height="20px" width="80%" />
                  <Skeleton height="20px" width="60%" />
                </VStack>
              ))
          : products.map((product) => (
              <Box
                key={product.id}
                bg={bgColor}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
                transition="transform 0.2s"
                _hover={{ transform: 'translateY(-5px)' }}
              >
                <Image
                  src={product.image_url}
                  alt={product.name}
                  height="200px"
                  width="100%"
                  objectFit="cover"
                />
                <Box p={6}>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading size="md">{product.name}</Heading>
                    <Badge colorScheme="green">
                      ${product.price.toFixed(2)}
                    </Badge>
                  </Flex>
                  <Text color={textColor} noOfLines={2} mb={4}>
                    {product.description}
                  </Text>
                  <Flex justify="space-between" align="center">
                    <Button
                      colorScheme="blue"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      View Details
                    </Button>
                    <IconButton
                      aria-label="Add to cart"
                      icon={<FiShoppingCart />}
                      colorScheme="green"
                      variant="ghost"
                    />
                  </Flex>
                </Box>
              </Box>
            ))}
      </SimpleGrid>
    </Container>
  );
};
```

#### 1.2 Product Details Page
```typescript
// src/pages/ProductDetails.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Image,
  Text,
  Button,
  VStack,
  Heading,
  Badge,
  useToast,
  Skeleton,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { FiShoppingCart } from 'react-icons/fi';

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { getProduct } = useProducts();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (id) {
          const data = await getProduct(id);
          setProduct(data);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch product details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8}>
          <Skeleton height="400px" />
          <VStack align="stretch" spacing={4}>
            <Skeleton height="40px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="100px" />
          </VStack>
        </Grid>
      </Container>
    );
  }

  if (!product) return null;

  return (
    <Container maxW="container.xl" py={8}>
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8}>
        <Box>
          <Image
            src={product.image_url}
            alt={product.name}
            borderRadius="lg"
            width="100%"
            height="400px"
            objectFit="cover"
          />
        </Box>
        <VStack align="stretch" spacing={6}>
          <Box>
            <Heading size="lg">{product.name}</Heading>
            <HStack spacing={4} mt={2}>
              <Badge colorScheme="green" fontSize="lg">
                ${product.price.toFixed(2)}
              </Badge>
              <Badge colorScheme={product.stock > 0 ? 'blue' : 'red'}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </HStack>
          </Box>

          <Tabs variant="enclosed">
            <TabList>
              <Tab>Description</Tab>
              <Tab>Specifications</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Text>{product.description}</Text>
              </TabPanel>
              <TabPanel>
                <VStack align="stretch" spacing={2}>
                  <Text>Category: {product.category.name}</Text>
                  <Text>Stock: {product.stock} units</Text>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Box>
            <Text mb={2}>Quantity:</Text>
            <HStack>
              <NumberInput
                value={quantity}
                onChange={(_, value) => setQuantity(value)}
                min={1}
                max={product.stock}
                width="100px"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Button
                leftIcon={<FiShoppingCart />}
                colorScheme="blue"
                size="lg"
                isDisabled={product.stock === 0}
                onClick={() => {
                  toast({
                    title: 'Added to Cart',
                    description: `${quantity} ${product.name} added to cart`,
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });
                }}
              >
                Add to Cart
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Grid>
    </Container>
  );
};
```

#### 1.3 Product Card Component
```typescript
// src/components/ProductCard.tsx
import React from 'react';
import {
  Box,
  Image,
  Text,
  Button,
  VStack,
  Badge,
  Flex,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiShoppingCart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    stock: number;
  };
  onAddToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-5px)' }}
    >
      <Image
        src={product.image_url}
        alt={product.name}
        height="200px"
        width="100%"
        objectFit="cover"
      />
      <Box p={6}>
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="xl" fontWeight="semibold">
            {product.name}
          </Text>
          <Badge colorScheme="green">
            ${product.price.toFixed(2)}
          </Badge>
        </Flex>
        <Text color={textColor} noOfLines={2} mb={4}>
          {product.description}
        </Text>
        <Flex justify="space-between" align="center">
          <Button
            colorScheme="blue"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            View Details
          </Button>
          <IconButton
            aria-label="Add to cart"
            icon={<FiShoppingCart />}
            colorScheme="green"
            variant="ghost"
            onClick={onAddToCart}
            isDisabled={product.stock === 0}
          />
        </Flex>
      </Box>
    </Box>
  );
};
```

#### 1.4 Update App Routes
```typescript
// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { Navigation } from './components/Navigation';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';

function App() {
  return (
    <ChakraProvider>
      <CSSReset />
      <AuthProvider>
        <ProductProvider>
          <Router>
            <Navigation />
            <Routes>
              <Route path="/" element={<Products />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Router>
        </ProductProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
```

#### 1.5 Update Navigation
```typescript
// src/components/Navigation.tsx
import React from 'react';
import {
  Box,
  Flex,
  Button,
  Link as ChakraLink,
  IconButton,
  useColorMode,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

export const Navigation = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  return (
    <Box bg="blue.500" px={4} position="sticky" top={0} zIndex={10}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <ChakraLink as={Link} to="/" fontSize="xl" fontWeight="bold" color="white">
            E-Commerce
          </ChakraLink>
        </Flex>

        <Flex alignItems="center" gap={4}>
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
            color="white"
            _hover={{ bg: 'blue.600' }}
          />

          <IconButton
            aria-label="Shopping cart"
            icon={<FiShoppingCart />}
            variant="ghost"
            color="white"
            _hover={{ bg: 'blue.600' }}
          />

          {isAuthenticated ? (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiUser />}
                variant="ghost"
                color="white"
                _hover={{ bg: 'blue.600' }}
              />
              <MenuList>
                <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
                <MenuItem onClick={() => navigate('/orders')}>Orders</MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button
              as={Link}
              to="/login"
              variant="outline"
              color="white"
              _hover={{ bg: 'blue.600' }}
            >
              Login
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};
```

## Product Service Implementation Guide

### 1. Service Setup

```bash
# Create new NestJS service
cd services
nest new product-service

# Install dependencies
cd product-service
npm install @nestjs/typeorm typeorm pg class-validator class-transformer @nestjs/swagger
```

### 2. Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_images table for multiple images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Product Service Implementation

#### 3.1 Entity Definitions

```typescript
// src/entities/category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

// src/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { ProductImage } from './product-image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  stock: number;

  @Column({ nullable: true })
  image_url: string;

  @ManyToOne(() => Category, category => category.products)
  category: Category;

  @Column()
  category_id: string;

  @OneToMany(() => ProductImage, image => image.product)
  images: ProductImage[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

// src/entities/product-image.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ default: false })
  is_primary: boolean;

  @ManyToOne(() => Product, product => product.images)
  product: Product;

  @Column()
  product_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
```

#### 3.2 DTOs

```typescript
// src/dto/create-product.dto.ts
import { IsString, IsNumber, IsUUID, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty()
  @IsUUID()
  category_id: string;
}

// src/dto/update-product.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

// src/dto/create-category.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
```

#### 3.3 Services

```typescript
// src/services/product.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: ['category', 'images'],
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'images'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
```

## API Configuration

```typescript
// src/config/api.ts
const API_BASE_URL = 'http://localhost:3002';

export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/products`,
  CATEGORIES: `${API_BASE_URL}/categories`,
} as const;
```

## Docker Configuration

```yaml
# docker-compose.yml (add to existing)
  product-service:
    build:
      context: ./services/product-service
      dockerfile: Dockerfile
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/ecommerce
      - PORT=3002
    depends_on:
      - postgres
```

## Implementation Details

### Authentication Flow
1. User registration:
   ```typescript
   POST /auth/register
   {
     "name": "string",
     "email": "string",
     "password": "string"
   }
   ```

2. User login:
   ```typescript
   POST /auth/login
   {
     "email": "string",
     "password": "string"
   }
   ```

3. Response format:
   ```typescript
   {
     "access_token": "string",
     "user": {
       "id": "string",
       "name": "string",
       "email": "string"
     }
   }
   ```

### Frontend State Management
- Uses React Context API for auth state management
- JWT token stored in localStorage
- Protected routes using auth guards

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Topics Covered

1. **Authentication & Authorization**
   - JWT-based auth
   - Password hashing
   - Protected routes
   - Role-based access control (upcoming)

2. **Database Management**
   - PostgreSQL with TypeORM
   - Database migrations
   - Entity relationships
   - Data validation

3. **Frontend Development**
   - React with TypeScript
   - Component architecture
   - State management
   - Form handling
   - UI/UX design

4. **Microservices Architecture**
   - Service separation
   - Inter-service communication
   - Docker containerization
   - Environment configuration

5. **API Design**
   - RESTful endpoints
   - DTO validation
   - Error handling
   - Response formatting

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend/web && npm install
   cd ../../services/auth-service && npm install
   cd ../../services/product-service && npm install
   ```

3. Set up environment variables:
   ```env
   # Auth Service
   DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
   JWT_SECRET=your-secret-key
   JWT_EXPIRATION=24h
   PORT=3001

   # Product Service
   DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
   PORT=3002
   ```

4. Start the services:
   ```bash
   docker-compose up -d
   ```

## Next Steps

1. Implement payment processing
2. Add order management
3. Implement admin dashboard
4. Add user roles and permissions
5. Add product reviews and ratings

## Contributing

Feel free to contribute to this project by submitting pull requests or creating issues for bugs and feature requests.
