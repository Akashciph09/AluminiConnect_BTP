import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentProfile from './sections/StudentProfile';
import StudentOpportunities from './sections/StudentOpportunities';
import StudentMentorship from './sections/StudentMentorship';
import StudentWorkshops from './sections/StudentWorkshops';

function StudentDashboard() {
  const theme = useTheme();
  const location = useLocation();

  const renderContent = () => {
    const path = location.pathname.split('/').pop();
    
    switch (path) {
      case 'profile':
        return <StudentProfile />;
      case 'opportunities':
        return <StudentOpportunities />;
      case 'mentorship':
        return <StudentMentorship />;
      case 'workshops':
        return <StudentWorkshops />;
      default:
        return <StudentOpportunities />;
    }
  };

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
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
}

export default StudentDashboard; 