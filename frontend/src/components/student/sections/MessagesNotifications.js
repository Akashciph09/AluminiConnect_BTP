import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button, Divider, Chip, IconButton, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MessageIcon from '@mui/icons-material/Message';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import axios from 'axios';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const MessagesNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3002/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setNotifications(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3002/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        'http://localhost:3002/api/notifications/read-all',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type, status) => {
    switch (type) {
      case 'job_application':
        if (status === 'accepted') return <CheckCircleIcon color="success" />;
        if (status === 'rejected') return <CancelIcon color="error" />;
        return <HourglassEmptyIcon color="warning" />;
      case 'project':
        return <MessageIcon color="primary" />;
      case 'email':
        return <EmailIcon color="primary" />;
      default:
        return <NotificationsIcon color="primary" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Messages & Notifications
        </Typography>
        {notifications.some(n => !n.read) && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      {/* Notifications */}
      <Typography variant="subtitle1" gutterBottom>
        Notifications
      </Typography>
      <List>
        {notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
            No notifications yet
          </Typography>
        ) : (
          notifications.map((notification) => (
            <StyledListItem
              key={notification._id}
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                cursor: 'pointer'
              }}
              onClick={() => handleMarkAsRead(notification._id)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'background.paper' }}>
                  {getNotificationIcon(notification.type, notification.status)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={notification.title}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {formatTime(notification.createdAt)}
                    </Typography>
                  </>
                }
              />
              {!notification.read && (
                <Chip
                  label="New"
                  color="primary"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </StyledListItem>
          ))
        )}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Messages */}
      <Typography variant="subtitle1" gutterBottom>
        Messages
      </Typography>
      <List>
        {/* Your existing messages code */}
      </List>
    </Box>
  );
};

export default MessagesNotifications; 