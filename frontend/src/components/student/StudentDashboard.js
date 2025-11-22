import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';

function StudentDashboard() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
      }}
    >
      <StudentSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
        }}
      >
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default StudentDashboard; 