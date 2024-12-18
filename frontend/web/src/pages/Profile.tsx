import { Box, Heading, Text, Button, useToast } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to logout',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <Heading mb={4}>Profile</Heading>
      <Text mb={2}>Name: {user.name}</Text>
      <Text mb={4}>Email: {user.email}</Text>
      <Button onClick={handleLogout} colorScheme="red">
        Logout
      </Button>
    </Box>
  );
};
