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
  Flex,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      toast({
        title: 'Registration successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to register. Please try again.',
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
      bg="white"
      alignItems="center"
      pl="15%"
    >
      <Box
        w="400px"
        bg="white"
        p={8}
        borderRadius="xl"
        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      >
        <Stack spacing={6}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Create your account
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="name">
                <FormLabel color="gray.600">Full Name</FormLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  size="lg"
                  bg="white"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #60A5FA" }}
                  _placeholder={{ color: 'gray.400' }}
                />
              </FormControl>

              <FormControl id="email">
                <FormLabel color="gray.600">Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  size="lg"
                  bg="white"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #60A5FA" }}
                  _placeholder={{ color: 'gray.400' }}
                />
              </FormControl>

              <FormControl id="password">
                <FormLabel color="gray.600">Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    bg="white"
                    border="1px"
                    borderColor="gray.200"
                    _hover={{ borderColor: "blue.400" }}
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #60A5FA" }}
                    _placeholder={{ color: 'gray.400' }}
                  />
                  <InputRightElement width="3rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: "blue.400" }}
                    >
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl id="confirm-password">
                <FormLabel color="gray.600">Confirm Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    bg="white"
                    border="1px"
                    borderColor="gray.200"
                    _hover={{ borderColor: "blue.400" }}
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #60A5FA" }}
                    _placeholder={{ color: 'gray.400' }}
                  />
                  <InputRightElement width="3rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: "blue.400" }}
                    >
                      {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

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
                Create Account
              </Button>
            </Stack>
          </form>

          <Text fontSize="sm" color="gray.600" textAlign="center">
            Already have an account?{' '}
            <ChakraLink as={Link} to="/login" color="blue.500" _hover={{ color: "blue.600" }}>
              Sign in
            </ChakraLink>
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
};

export default Register;
