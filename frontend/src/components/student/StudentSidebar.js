import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Box,
  Paper,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

const menuItems = [
  { text: 'Profile', icon: <PersonIcon />, path: '/student/profile' },
  { text: 'Opportunities', icon: <WorkIcon />, path: '/student/opportunities' },
  { text: 'Mentorship', icon: <SchoolIcon />, path: '/student/mentorship' },
  { text: 'Workshops', icon: <EventIcon />, path: '/student/workshops' },
  { text: 'Experiences', icon: <CodeIcon />, path: '/student/show-tell' },
];

function StudentSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    if (!string) return 'S';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  // Compute avatar source or fallback initial
  const avatarSrc =
    user?.profile?.profileImage || user?.profilePicture || user?.profile?.profilePicture || '';
  const avatarInitial = (user && user.name && user.name.trim().length > 0)
    ? user.name.trim().charAt(0).toUpperCase()
    : 'S';

  const drawer = (
    <div className="flex flex-col justify-between h-screen bg-[#0f172a] text-white">
      {/* Enhanced Top Section */}
      <div className="bg-[#0f172a] text-white pt-20 pb-8 border-b border-gray-700">
        {/* Portal Title with Enhanced Styling */}
        <Typography
          variant="h5"
          sx={{
            textAlign: 'center',
            mb: 4,
            fontWeight: 800,
            letterSpacing: '1px',
            background: 'linear-gradient(45deg, #8A2BE2 30%, #7F00FF 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          Student Portal
        </Typography>

        {/* User Name Box with Enhanced Styling */}
        <Paper
          elevation={3}
          sx={{
            mx: 3,
            p: 2,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={avatarSrc || undefined}
              alt={user?.name || 'Student'}
              sx={{
                bgcolor: avatarSrc ? 'transparent' : 'primary.main',
                width: 44,
                height: 44,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                objectFit: 'cover',
              }}
            >
              {!avatarSrc && avatarInitial}
            </Avatar>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#FFFFFF',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                flex: 1,
                textAlign: 'left',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {capitalizeFirstLetter(user?.name) || 'Student User'}
            </Typography>
          </Box>
        </Paper>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <List className="space-y-2 px-4">
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                className={`rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-purple-600 text-white' 
                    : 'hover:bg-purple-700'
                }`}
                sx={{
                  py: 1.5,
                  px: 2,
                }}
              >
                <ListItemIcon 
                  className={`min-w-[40px] ${
                    location.pathname === item.path ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  className={`${
                    location.pathname === item.path ? 'font-bold' : ''
                  }`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-700 mt-auto">
        <ListItemButton
          onClick={handleLogout}
          className="rounded-lg hover:bg-red-600 transition-colors duration-200"
          sx={{
            py: 1.5,
            px: 2,
            color: 'red',
            '&:hover': {
              backgroundColor: 'red',
              color: 'white',
            },
          }}
        >
          <ListItemIcon className="min-w-[40px] text-red-500">
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </div>
    </div>
  );

  return (
    <div className="w-[280px] flex-shrink-0">
      {isMobile ? (
        <>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className="fixed left-1/2 bottom-5 -translate-x-1/2 bg-purple-600 text-white hover:bg-purple-700"
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            className="block sm:hidden"
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                bgcolor: '#0f172a',
              },
            }}
          >
            {drawer}
          </Drawer>
        </>
      ) : (
        <Drawer
          variant="permanent"
          className="hidden sm:block"
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#0f172a',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </div>
  );
}

export default StudentSidebar; 