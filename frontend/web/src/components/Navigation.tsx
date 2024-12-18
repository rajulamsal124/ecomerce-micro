import { Box, Button, Flex, Link as ChakraLink } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box bg="#171B21" py={4} borderBottom="1px" borderColor="whiteAlpha.100" w="100%">
      <Flex 
        maxW="1200px" 
        mx="auto" 
        px={8} 
        alignItems="center" 
        justifyContent="flex-start"
        w="100%"
      >
        <Flex gap={6}>
          {isAuthenticated ? (
            <>
              <ChakraLink as={Link} to="/profile" color="white" _hover={{ color: "blue.400" }}>
                Profile
              </ChakraLink>
              <Button
                variant="ghost"
                color="white"
                _hover={{ color: "blue.400" }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <ChakraLink 
                as={Link} 
                to="/login" 
                color="white"
                _hover={{ color: "blue.400" }}
              >
                Login
              </ChakraLink>
              <ChakraLink 
                as={Link} 
                to="/register" 
                color="white"
                _hover={{ color: "blue.400" }}
              >
                Register
              </ChakraLink>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};
