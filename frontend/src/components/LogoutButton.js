import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        variant="outlined"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{
          borderRadius: '20px',
          textTransform: 'none',
          px: 2,
          py: 1,
          '&:hover': {
            backgroundColor: 'error.light',
            color: 'white',
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Logout
        </Typography>
      </Button>
    </Box>
  );
};

export default LogoutButton; 