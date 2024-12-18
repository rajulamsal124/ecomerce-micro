import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Link as ChakraLink,
  InputGroup,
  InputRightElement,
  useToast,
  Checkbox,
  Flex,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/profile');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to login. Please check your credentials.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex 
      minH="calc(100vh - 72px)" 
      w="100%" 
      bg="#0B0E11"
      alignItems="center"
      pl="15%"
    >
      <Box
        w="400px"
        bg="white"
        p={8}
        borderRadius="md"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      >
        <Stack spacing={6}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Sign in to your account
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email">
                <FormLabel color="gray.700">Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  size="lg"
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.400", boxShadow: "none" }}
                />
              </FormControl>

              <FormControl id="password">
                <FormLabel color="gray.700">Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    bg="gray.50"
                    border="1px"
                    borderColor="gray.200"
                    _hover={{ borderColor: "blue.400" }}
                    _focus={{ borderColor: "blue.400", boxShadow: "none" }}
                  />
                  <InputRightElement width="3rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      color="gray.400"
                    >
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Stack
                direction="row"
                align="center"
                justify="space-between"
                fontSize="sm"
                pt={1}
              >
                <Checkbox
                  colorScheme="blue"
                  isChecked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  <Text color="gray.600">Remember me</Text>
                </Checkbox>
                <ChakraLink color="blue.500" _hover={{ color: "blue.600" }}>
                  Forgot password?
                </ChakraLink>
              </Stack>

              <Button
                type="submit"
                size="lg"
                fontSize="md"
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600" }}
                w="100%"
                mt={2}
              >
                Sign in
              </Button>
            </Stack>
          </form>

          <Text fontSize="sm" color="gray.600" textAlign="center" pt={2}>
            Don't have an account?{' '}
            <ChakraLink as={Link} to="/register" color="blue.500" _hover={{ color: "blue.600" }}>
              Sign up
            </ChakraLink>
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
};

export default Login;
