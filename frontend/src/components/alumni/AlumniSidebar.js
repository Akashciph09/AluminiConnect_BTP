import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Divider
} from '@mui/material';
import { 
  Person as PersonIcon,
  Work as WorkIcon,
  Chat as ChatIcon,
  Menu as MenuIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  RequestQuote as RequestQuoteIcon,
  Event as EventIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoutButton from '../common/LogoutButton';

const drawerWidth = 240;

const menuItems = [
  { text: 'Profile', icon: <PersonIcon />, path: 'profile' },
  { text: 'Opportunities', icon: <WorkIcon />, path: 'opportunities' },
  { text: 'Applications', icon: <PeopleIcon />, path: 'applications' },
  { text: 'Workshops', icon: <EventIcon />, path: 'workshops' },
  { text: 'Mentorship Requests', icon: <SchoolIcon />, path: 'mentorship-requests' },
];

function AlumniSidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: theme.palette.background.paper,
    }}>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ 
          color: theme.palette.primary.main,
          fontWeight: 'bold'
        }}>
          Alumni Portal
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(`/alumni/${item.path}`);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              backgroundColor: location.pathname.includes(item.path)
                ? 'rgba(25, 118, 210, 0.08)'
                : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
              mb: 1,
              borderRadius: 1,
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname.includes(item.path)
                ? theme.palette.primary.main
                : theme.palette.text.secondary 
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{
                color: location.pathname.includes(item.path)
                  ? theme.palette.primary.main
                  : theme.palette.text.primary
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <LogoutButton />
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1200,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default AlumniSidebar; 