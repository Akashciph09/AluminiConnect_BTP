import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person as PersonIcon,
  People as NetworkIcon,
  Work as OpportunitiesIcon,
  Email as MessagesIcon,
  Settings as SettingsIcon,
  School as MentorshipIcon,
  Event as WorkshopsIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Workshops from './components/alumni/sections/Workshops';
import StudentWorkshops from './components/student/sections/StudentWorkshops';

const drawerWidth = 240;

const AlumniSidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Profile', icon: <PersonIcon />, path: '/alumni/profile' },
    { text: 'Network', icon: <NetworkIcon />, path: '/alumni/network' },
    { text: 'Opportunities', icon: <OpportunitiesIcon />, path: '/alumni/opportunities' },
    { text: 'Workshops', icon: <BuildIcon />, path: '/alumni/workshops' },
    { text: 'Messages', icon: <MessagesIcon />, path: '/alumni/messages' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/alumni/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            margin: '0 auto',
            border: '3px solid white',
          }}
          src={user?.profilePicture}
        >
          {user?.name?.[0]}
        </Avatar>
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
          {user?.name || 'Alumni User'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          {user?.email}
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? theme.palette.action.selected : 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default AlumniSidebar; 