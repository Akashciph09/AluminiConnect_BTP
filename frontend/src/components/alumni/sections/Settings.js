import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Divider,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const Settings = () => {
  const [settings, setSettings] = React.useState({
    emailNotifications: true,
    messageNotifications: true,
    profileVisibility: true,
    twoFactorAuth: false,
  });

  const handleToggle = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
          Settings
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            Notifications
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive email updates about messages and opportunities"
              />
              <Switch
                edge="end"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Message Notifications"
                secondary="Receive notifications for new messages"
              />
              <Switch
                edge="end"
                checked={settings.messageNotifications}
                onChange={() => handleToggle('messageNotifications')}
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            Privacy
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <VisibilityIcon />
              </ListItemIcon>
              <ListItemText
                primary="Profile Visibility"
                secondary="Make your profile visible to students"
              />
              <Switch
                edge="end"
                checked={settings.profileVisibility}
                onChange={() => handleToggle('profileVisibility')}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText
                primary="Two-Factor Authentication"
                secondary="Add an extra layer of security to your account"
              />
              <Switch
                edge="end"
                checked={settings.twoFactorAuth}
                onChange={() => handleToggle('twoFactorAuth')}
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            Account
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ mt: 1 }}
          >
            Delete Account
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings; 